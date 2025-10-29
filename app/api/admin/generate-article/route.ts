import { NextRequest, NextResponse } from 'next/server';
import { generateArticleWithGemini } from '@/lib/gemini';
import { cookies } from 'next/headers';

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

    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.' 
      }, { status: 500 });
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