import { NextRequest, NextResponse } from 'next/server';
import { generateArticleWithGemini } from '@/lib/gemini';
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

    const { apiKey, topic } = await request.json();

    if (!apiKey || !topic) {
      return NextResponse.json({ error: 'API key and topic are required' }, { status: 400 });
    }

    const result = await generateArticleWithGemini(apiKey, topic);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating article:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate article' 
    }, { status: 500 });
  }
}