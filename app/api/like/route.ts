import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();
    const userIp = request.headers.get('x-forwarded-for') || 'unknown';

    // Check if user already liked this article
    const { data: existingLike } = await supabase
      .from(TABLES.LIKES)
      .select('*')
      .eq('article_id', articleId)
      .eq('user_ip', userIp)
      .single();

    if (existingLike) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }

    // Add like
    const { error: likeError } = await supabase
      .from(TABLES.LIKES)
      .insert({ article_id: articleId, user_ip: userIp });

    if (likeError) throw likeError;

    // Increment like count
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