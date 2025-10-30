import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase, TABLES } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nowIso = new Date().toISOString();

    const { data: dueArticles, error: fetchErr } = await supabase
      .from(TABLES.ARTICLES)
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowIso);

    if (fetchErr) throw fetchErr;

    if (!dueArticles || !dueArticles.length) {
      return NextResponse.json({ published: 0, message: 'No articles due' });
    }

    const ids = dueArticles.map(a => a.id);
    const { error: updateErr } = await supabase
      .from(TABLES.ARTICLES)
      .update({ status: 'published', published_at: nowIso })
      .in('id', ids);

    if (updateErr) throw updateErr;

    return NextResponse.json({ published: ids.length });
  } catch (err: any) {
    console.error('Publisher error:', err);
    return NextResponse.json({ error: err.message || 'Failed to publish' }, { status: 500 });
  }
}
