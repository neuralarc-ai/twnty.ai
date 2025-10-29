import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search in title, content, excerpt, and hashtags
    const searchTerm = `%${query}%`;
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ results: [] });
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}