import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search in title, content, teaser, and hashtags
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,teaser.ilike.%${query}%,hashtags.cs.{${query}}`)
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