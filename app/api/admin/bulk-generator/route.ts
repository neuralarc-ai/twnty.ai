import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase, TABLES } from '@/lib/supabase';
import { generateArticleWithGemini } from '@/lib/gemini';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

// In-memory progress store (for production, use Redis or database)
const progressStore = new Map<string, { stage: string; progress: number; total: number; message: string }>();

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

function parseCsvTopics(text: string): string[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // If file has a header like "topic", drop it
  if (lines.length && /^topic(s)?$/i.test(lines[0].replace(/[^a-z]/gi, ''))) {
    return lines.slice(1);
  }
  return lines;
}

async function readTopicsFromFile(file: File): Promise<string[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    const text = await file.text();
    return parseCsvTopics(text);
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
    // flatten first column or column named Topic
    const topics: string[] = [];
    if (rows && rows.length) {
      const header = (rows[0] || []) as any[];
      const topicColIndex = header.findIndex((h: any) => String(h || '').toLowerCase().includes('topic'));
      if (topicColIndex >= 0) {
        for (let i = 1; i < rows.length; i++) {
          const val = rows[i]?.[topicColIndex];
          if (val) topics.push(String(val).trim());
        }
      } else {
        for (let i = 0; i < rows.length; i++) {
          const val = rows[i]?.[0];
          if (val) topics.push(String(val).trim());
        }
      }
    }
    return topics.filter(Boolean);
  }
  // Fallback: try reading as text lines
  const text = await file.text();
  return parseCsvTopics(text);
}

async function uploadImageToStorage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from('article-images')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(filename);
  return publicUrl;
}

function updateProgress(jobId: string, stage: string, progress: number, total: number, message: string) {
  progressStore.set(jobId, { stage, progress, total, message });
}

// SSE endpoint for progress updates
export async function GET(request: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const interval = setInterval(() => {
        const progress = progressStore.get(jobId);
        if (progress) {
          send(progress);
          if (progress.progress >= progress.total || progress.stage === 'complete' || progress.stage === 'error') {
            clearInterval(interval);
            setTimeout(() => progressStore.delete(jobId), 5000); // Keep for 5s after completion
            controller.close();
          }
        }
      }, 500);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const topicsFile = formData.get('topicsFile') as File | null;
    const imageFiles = formData.getAll('images').filter(v => v instanceof File) as File[];

    if (!topicsFile) {
      return NextResponse.json({ error: 'topicsFile is required' }, { status: 400 });
    }
    if (!imageFiles.length) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    // Generate job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Start async processing
    (async () => {
      try {
        updateProgress(jobId, 'parsing', 0, 1, 'Parsing topics file...');
        const topics = await readTopicsFromFile(topicsFile);
        if (!topics.length) {
          updateProgress(jobId, 'error', 0, 0, 'No topics found in file');
          return;
        }

        const totalSteps = 1 + imageFiles.length + topics.length;
        updateProgress(jobId, 'uploading', 1, totalSteps, `Uploading ${imageFiles.length} images...`);
        
        const imageUrls: string[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const url = await uploadImageToStorage(imageFiles[i]);
          imageUrls.push(url);
          updateProgress(jobId, 'uploading', 1 + i + 1, totalSteps, `Uploaded ${i + 1}/${imageFiles.length} images`);
        }

        updateProgress(jobId, 'generating', 1 + imageFiles.length, totalSteps, `Generating ${topics.length} articles...`);
        const createdIds: string[] = [];
        const now = Date.now();

        for (let i = 0; i < topics.length; i++) {
          const topic = topics[i];
          updateProgress(jobId, 'generating', 1 + imageFiles.length + i, totalSteps, `Generating article ${i + 1}/${topics.length}: ${topic.substring(0, 50)}...`);
          
          const generated = await generateArticleWithGemini(apiKey, topic);
          const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)] || null;
          const scheduledAt = new Date(now + i * 60 * 60 * 1000).toISOString();

          const insertBody: any = {
            title: generated.title || topic,
            content: generated.content,
            excerpt: generated.excerpt || generated.content?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
            image_url: randomImageUrl,
            external_links: [],
            hashtags: generated.hashtags || [],
            status: 'scheduled',
            scheduled_at: scheduledAt,
          };

          const { data, error } = await supabase
            .from(TABLES.ARTICLES)
            .insert(insertBody)
            .select('id')
            .single();
          if (error) throw error;
          if (data?.id) createdIds.push(data.id);

          updateProgress(jobId, 'scheduling', 1 + imageFiles.length + topics.length + i, totalSteps, `Scheduled ${i + 1}/${topics.length} articles`);
        }

        updateProgress(jobId, 'complete', totalSteps, totalSteps, `Successfully scheduled ${createdIds.length} articles using ${imageUrls.length} images`);
      } catch (err: any) {
        updateProgress(jobId, 'error', 0, 0, `Error: ${err.message}`);
      }
    })();

    return NextResponse.json({ jobId, message: 'Processing started' });
  } catch (err: any) {
    console.error('Bulk generator error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process bulk generation' }, { status: 500 });
  }
}

