import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Simple authentication (in production, use proper password hashing)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@twnty.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    if (email === adminEmail && password === adminPassword) {
      // Set session cookie
      const cookieStore = await cookies();
      
      // Get the domain from the request
      const hostname = request.headers.get('host') || '';
      const isLocalhost = hostname.includes('localhost');
      const domain = isLocalhost ? undefined : `.${hostname.split(':')[0].split('.').slice(-2).join('.')}`;
      
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        ...(domain && { domain }),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}