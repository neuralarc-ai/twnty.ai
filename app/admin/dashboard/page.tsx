import { checkAuth } from '@/lib/auth';
import { supabase, TABLES } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import DashboardStats from '@/components/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
import { FileText, Eye, Heart, MessageCircle, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

async function getAllArticles() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return [];
    }

    const { data: articles, error } = await supabase
    .from(TABLES.ARTICLES)
    .select('*')
    .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

  return articles || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

async function getRecentArticles() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return [];
    }

    const { data: recentArticles, error } = await supabase
    .from(TABLES.ARTICLES)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

    if (error) {
      console.error('Error fetching recent articles:', error);
      return [];
    }

  return recentArticles || [];
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

export const revalidate = 0;

export default async function AdminDashboard() {
  await checkAuth();
  const allArticles = await getAllArticles();
  const recentArticles = await getRecentArticles();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Here's what's happening with your blog.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts Section */}
        <DashboardCharts articles={allArticles} />

        {/* Recent Articles */}
        <div className="bg-white border-2 border-black">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                <h2 className="text-xl font-bold">Recent Articles</h2>
              </div>
              <Link
                href="/admin/articles"
                className="text-sm font-medium hover:opacity-70 transition-opacity"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentArticles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No articles yet. Create your first article to get started!
              </div>
            ) : (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/edit/${article.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {article.teaser}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          article.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : article.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}