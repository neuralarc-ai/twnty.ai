import { checkAuth } from '@/lib/auth';
import { supabase, TABLES } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import BulkSelectTable from '@/components/BulkSelectTable';
import { headers } from 'next/headers';

async function getScheduledArticles() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return [];
    }

    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled articles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching scheduled articles:', error);
    return [];
  }
}

async function getPublishedArticles() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return [];
    }

    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching published articles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching published articles:', error);
    return [];
  }
}

export const revalidate = 0;

export default async function ArticleQueuePage() {
  await checkAuth();
  const scheduledArticles = await getScheduledArticles();
  const publishedArticles = await getPublishedArticles();
  
  // Get the public domain URL for article links
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  let publicDomain = host;
  if (host.startsWith('admin.') || host.startsWith('admin.localhost')) {
    publicDomain = host.replace(/^admin\./, '').replace(/^admin\.localhost/, 'localhost');
  }
  
  const baseUrl = `${protocol}://${publicDomain}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Article Queue</h1>
            <p className="text-gray-600">Manage scheduled and published articles</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
          >
            New Article
          </Link>
        </div>

        {/* Scheduled Articles Section */}
        <BulkSelectTable 
          articles={scheduledArticles} 
          type="scheduled"
        />

        {/* Published Articles Section */}
        <BulkSelectTable 
          articles={publishedArticles} 
          type="published"
          baseUrl={baseUrl}
        />
      </div>
    </AdminLayout>
  );
}

