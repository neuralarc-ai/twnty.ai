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
    const { data, error } = await supabase
      .from(TABLES.AUTHOR)
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json(data || null);
  } catch (error) {
    console.error('Error fetching author info:', error);
    return NextResponse.json({ error: 'Failed to fetch author info' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if author info exists
    const { data: existing } = await supabase
      .from(TABLES.AUTHOR)
      .select('id')
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from(TABLES.AUTHOR)
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase
        .from(TABLES.AUTHOR)
        .insert(body)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error saving author info:', error);
    return NextResponse.json({ error: 'Failed to save author info' }, { status: 500 });
  }
}