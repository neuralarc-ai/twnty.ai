import { checkAuth } from '@/lib/auth';
import { supabase, TABLES } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Eye, Heart, MessageCircle } from 'lucide-react';
import DeleteArticleButton from '@/components/DeleteArticleButton';

async function getArticles() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return [];
    }

  const { data, error } = await supabase
    .from(TABLES.ARTICLES)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export const revalidate = 0;

export default async function ArticlesPage() {
  await checkAuth();
  const articles = await getArticles();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Articles</h1>
            <p className="text-gray-600">Manage all your blog articles</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
          >
            New Article
          </Link>
        </div>

        {/* Articles Table */}
        <div className="border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
                      No articles yet. Create your first article!
                    </td>
                  </tr>
                ) : (
                  articles.map((article: any) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{article.title}</div>
                        {article.excerpt && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {article.excerpt}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          article.status === 'published' ? 'bg-green-100 text-green-700' :
                          article.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            {article.views || 0}
                          </span>
                          <span className="flex items-center">
                            <Heart size={14} className="mr-1" />
                            {article.likes || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {article.status === 'published' && (
                            <Link
                              href={`/article/${article.id}`}
                              target="_blank"
                              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye size={18} />
                            </Link>
                          )}
                          <Link
                            href={`/admin/articles/edit/${article.id}`}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <DeleteArticleButton articleId={article.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}