import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    console.log('Like request:', { articleId });

    // Increment like count directly
    const { data: article } = await supabase
      .from(TABLES.ARTICLES)
      .select('likes')
      .eq('id', articleId)
      .single();

    await supabase
      .from(TABLES.ARTICLES)
      .update({ likes: (article?.likes || 0) + 1 })
      .eq('id', articleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking article:', error);
    return NextResponse.json({ error: 'Failed to like article' }, { status: 500 });
  }
}
