import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase, TABLES } from '@/lib/supabase';
import { generateArticleWithGemini } from '@/lib/gemini';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for bulk processing

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

    let formData;
    try {
      formData = await req.formData();
    } catch (err: any) {
      // Handle body size limit errors
      if (err.message && (err.message.includes('Too Large') || err.message.includes('size limit') || err.message.includes('PAYLOAD_TOO_LARGE'))) {
        return NextResponse.json({ 
          error: 'File size too large. Please reduce the number of images or their file sizes. Vercel\'s maximum request body size is 4.5MB for Serverless Functions.' 
        }, { status: 413 });
      }
      throw err;
    }
    const topicsFile = formData.get('topicsFile') as File | null;
    const imageUrlsStr = formData.get('imageUrls') as string | null;

    if (!topicsFile) {
      return NextResponse.json({ error: 'topicsFile is required' }, { status: 400 });
    }
    
    let imageUrls: string[] = [];
    if (imageUrlsStr) {
      try {
        imageUrls = JSON.parse(imageUrlsStr);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid imageUrls format' }, { status: 400 });
      }
    }
    
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'At least one image URL is required' }, { status: 400 });
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

        // Images are already uploaded from client, so we can proceed directly to generation
        const totalSteps = topics.length;
        updateProgress(jobId, 'generating', 0, totalSteps, `Generating ${topics.length} articles using ${imageUrls.length} images...`);
        
        const createdIds: string[] = [];
        const now = Date.now();

        for (let i = 0; i < topics.length; i++) {
          const topic = topics[i];
          updateProgress(jobId, 'generating', i, totalSteps, `Generating article ${i + 1}/${topics.length}: ${topic.substring(0, 50)}...`);
          
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

          updateProgress(jobId, 'scheduling', i + 1, totalSteps, `Scheduled ${i + 1}/${topics.length} articles`);
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

