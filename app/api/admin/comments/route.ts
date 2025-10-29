import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const searchQuery = searchParams.get('search');

    let query = supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by article if provided
    if (articleId) {
      query = query.eq('article_id', articleId);
    }

    // Search by author name, email, or content
    if (searchQuery) {
      query = query.or(`author_name.ilike.%${searchQuery}%,author_email.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    const { data: comments, error } = await query;

    if (error) throw error;

    // Fetch article titles for each comment
    if (comments && comments.length > 0) {
      const articleIds = [...new Set(comments.map((c: any) => c.article_id))];
      const { data: articles } = await supabase
        .from(TABLES.ARTICLES)
        .select('id, title')
        .in('id', articleIds);

      const articlesMap = new Map(
        (articles || []).map((a: any) => [a.id, a.title])
      );

      const commentsWithArticles = comments.map((comment: any) => ({
        ...comment,
        article_title: articlesMap.get(comment.article_id) || 'Unknown Article',
      }));

      return NextResponse.json(commentsWithArticles || []);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from(TABLES.COMMENTS)
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

