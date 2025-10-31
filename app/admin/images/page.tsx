import { checkAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import ImageBulkSelectTable from '@/components/ImageBulkSelectTable';
import Link from 'next/link';

async function getImages() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return [];
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
      return [];
    }

    // Map files to include public URLs
    const images = (data || []).map((file) => {
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(file.name);
      
      return {
        name: file.name,
        url: publicUrl,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at || file.created_at,
        mimetype: file.metadata?.mimetype || file.metadata?.contentType || 'image/*',
      };
    });

    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ImagesPage() {
  await checkAuth();
  const images = await getImages();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Image Manager</h1>
            <p className="text-gray-600">View and manage uploaded images from storage</p>
          </div>
          <Link
            href="/admin/bulk-generator"
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
          >
            Upload Images
          </Link>
        </div>

        <ImageBulkSelectTable images={images} />
      </div>
    </AdminLayout>
  );
}

