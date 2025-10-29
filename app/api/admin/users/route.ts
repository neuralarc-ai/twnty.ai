import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { cookies } from 'next/headers';

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

    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // In production, use proper password hashing (bcrypt, argon2, etc.)
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .insert({
        email,
        password_hash: password, // In production, hash this!
        name,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: { id: data.id, email: data.email, name: data.name } });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}