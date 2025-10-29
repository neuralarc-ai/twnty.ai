import { NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch published articles ordered by published_at
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('id, title, image_url, excerpt, published_at, status')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: 'Database error', details: error },
        { status: 500 }
      );
    }

    const articles = data || [];
    const secondArticle = articles[1];

    return NextResponse.json({
      totalArticles: articles.length,
      secondArticle: secondArticle
        ? {
            id: secondArticle.id,
            title: secondArticle.title,
            image_url: secondArticle.image_url,
            image_url_length: secondArticle.image_url?.length || 0,
            image_url_type: typeof secondArticle.image_url,
            image_url_is_null: secondArticle.image_url === null,
            image_url_is_empty_string: secondArticle.image_url === '',
            image_url_trimmed: secondArticle.image_url?.trim() || '',
            excerpt: secondArticle.excerpt,
            published_at: secondArticle.published_at,
            status: secondArticle.status,
          }
        : null,
      allArticles: articles.map((a, idx) => ({
        index: idx,
        id: a.id,
        title: a.title,
        has_image: !!a.image_url && a.image_url.trim() !== '',
        image_url_preview: a.image_url
          ? a.image_url.substring(0, 100) + (a.image_url.length > 100 ? '...' : '')
          : null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

