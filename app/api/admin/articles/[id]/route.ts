import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    // Map database column names to frontend-friendly names
    const mappedData = {
      ...data,
      featured_image: data.image_url,
      teaser: data.excerpt,
    };

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const updateData: any = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || body.teaser,
      image_url: body.image_url || body.featured_image,
      audio_url: body.audio_url,
      video_url: body.video_url,
      external_links: body.external_links,
      hashtags: body.hashtags || [],
      status: body.status,
      updated_at: new Date().toISOString(),
    };

    // Only add scheduled_at if it has a value
    if (body.scheduled_at && body.status === 'scheduled') {
      updateData.scheduled_at = body.scheduled_at;
    }

    // Set published_at if status is being changed to published
    if (body.status === 'published') {
      const { data: currentArticle } = await supabase
        .from(TABLES.ARTICLES)
        .select('published_at')
        .eq('id', params.id)
        .single();
      
      if (!currentArticle?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from(TABLES.ARTICLES)
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}