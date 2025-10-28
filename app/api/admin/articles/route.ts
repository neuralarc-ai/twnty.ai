import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

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
    
    const articleData = {
      title: body.title,
      content: body.content,
      teaser: body.excerpt || body.teaser || body.content.substring(0, 200) + '...',
      featured_image: body.image_url || body.featured_image,
      media_url: body.audio_url || body.video_url || body.media_url,
      media_type: body.audio_url ? 'audio' : body.video_url ? 'video' : null,
      hashtags: body.hashtags || [],
      status: body.status || 'draft',
      scheduled_at: body.scheduled_at || null,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    };

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