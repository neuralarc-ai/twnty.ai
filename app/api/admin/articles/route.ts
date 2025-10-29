import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate image_url - reject blob URLs
    let imageUrl = body.image_url || body.featured_image;
    if (imageUrl && imageUrl.startsWith('blob:')) {
      console.warn('Rejected blob URL, setting image_url to null');
      imageUrl = null; // Reject blob URLs - they're temporary and won't work
    }
    
    const articleData: any = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || body.teaser || body.content.substring(0, 200) + '...',
      image_url: imageUrl || null,
      audio_url: body.audio_url,
      video_url: body.video_url,
      external_links: body.external_links || [],
      hashtags: body.hashtags || [],
      status: body.status || 'draft',
    };

    // Only add scheduled_at if it has a value
    if (body.scheduled_at && body.status === 'scheduled') {
      articleData.scheduled_at = body.scheduled_at;
    }

    // Only add published_at if status is published
    if (body.status === 'published') {
      articleData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create article' 
    }, { status: 500 });
  }
}