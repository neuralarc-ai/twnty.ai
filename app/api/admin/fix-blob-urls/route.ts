import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

/**
 * Fix blob URLs in the database
 * This endpoint finds all articles with blob URLs and sets their image_url to null
 * You can then manually re-upload the images through the admin panel
 */
export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all articles with blob URLs
    const { data: allArticles, error: fetchError } = await supabase
      .from(TABLES.ARTICLES)
      .select('id, title, image_url')
      .not('image_url', 'is', null);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Database error', details: fetchError },
        { status: 500 }
      );
    }

    const blobUrlArticles = (allArticles || []).filter(
      article => article.image_url && typeof article.image_url === 'string' && article.image_url.startsWith('blob:')
    );

    if (blobUrlArticles.length === 0) {
      return NextResponse.json({
        message: 'No articles with blob URLs found',
        fixed: 0,
        articles: [],
      });
    }

    // Update all blob URLs to null
    const articleIds = blobUrlArticles.map(a => a.id);
    const { data: updatedArticles, error: updateError } = await supabase
      .from(TABLES.ARTICLES)
      .update({ image_url: null })
      .in('id', articleIds)
      .select('id, title, image_url');

    if (updateError) {
      return NextResponse.json(
        { error: 'Update error', details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Fixed ${blobUrlArticles.length} article(s) with blob URLs`,
      fixed: blobUrlArticles.length,
      articles: blobUrlArticles.map(a => ({
        id: a.id,
        title: a.title,
        old_image_url: a.image_url,
      })),
      updated: updatedArticles,
    });
  } catch (error) {
    console.error('Error fixing blob URLs:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check which articles have blob URLs without fixing them
 */
export async function GET() {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: allArticles, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('id, title, image_url, status')
      .not('image_url', 'is', null);

    if (error) {
      return NextResponse.json(
        { error: 'Database error', details: error },
        { status: 500 }
      );
    }

    const blobUrlArticles = (allArticles || []).filter(
      article => article.image_url && typeof article.image_url === 'string' && article.image_url.startsWith('blob:')
    );

    return NextResponse.json({
      count: blobUrlArticles.length,
      articles: blobUrlArticles.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
        image_url: a.image_url,
      })),
    });
  } catch (error) {
    console.error('Error checking blob URLs:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

