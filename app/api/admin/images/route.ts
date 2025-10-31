import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

// GET - List all images from storage
export async function GET(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.storage
      .from('article-images')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing images:', error);
      return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
    }

    // Map files to include public URLs
    const images = await Promise.all(
      (data || []).map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(file.name);
        
        return {
          name: file.name,
          url: publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
          mimetype: file.metadata?.mimetype || file.metadata?.contentType || 'image/*',
        };
      })
    );

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch images' }, { status: 500 });
  }
}

// DELETE - Delete images from storage
export async function DELETE(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageNames } = body;

    if (!Array.isArray(imageNames) || imageNames.length === 0) {
      return NextResponse.json({ error: 'imageNames must be a non-empty array' }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from('article-images')
      .remove(imageNames);

    if (error) {
      console.error('Error deleting images:', error);
      throw error;
    }

    return NextResponse.json({ success: true, deleted: imageNames.length });
  } catch (error: any) {
    console.error('Error deleting images:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete images' }, { status: 500 });
  }
}

