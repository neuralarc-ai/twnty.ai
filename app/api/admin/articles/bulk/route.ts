import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleIds } = body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json({ error: 'articleIds must be a non-empty array' }, { status: 400 });
    }

    const { error } = await supabase
      .from(TABLES.ARTICLES)
      .delete()
      .in('id', articleIds);

    if (error) throw error;

    return NextResponse.json({ success: true, deleted: articleIds.length });
  } catch (error: any) {
    console.error('Error deleting articles:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete articles' }, { status: 500 });
  }
}

