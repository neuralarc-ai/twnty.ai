import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

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

    // Get all stats in parallel for better performance
    const [
      { count: totalArticles },
      { count: totalVisitors },
      { count: totalLikes },
      { count: totalComments }
    ] = await Promise.all([
      supabase.from(TABLES.ARTICLES).select('*', { count: 'exact', head: true }),
      supabase.from(TABLES.VISITORS).select('*', { count: 'exact', head: true }),
      supabase.from(TABLES.LIKES).select('*', { count: 'exact', head: true }),
      supabase.from(TABLES.COMMENTS).select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      totalArticles: totalArticles || 0,
      totalVisitors: totalVisitors || 0,
      totalLikes: totalLikes || 0,
      totalComments: totalComments || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}