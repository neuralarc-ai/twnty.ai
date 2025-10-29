'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Trash2, Search, Eye, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  article_title?: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArticle, setFilterArticle] = useState<string>('');
  const [articles, setArticles] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    fetchArticles();
    fetchComments();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComments();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterArticle]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.map((a: any) => ({ id: a.id, title: a.title })));
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterArticle) params.append('articleId', filterArticle);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/comments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comments</h1>
          <p className="text-gray-600 mt-1">Manage and moderate comments</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={24} />
          <span className="text-xl font-semibold">{comments.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Article Filter */}
          <select
            value={filterArticle}
            onChange={(e) => setFilterArticle(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
          >
            <option value="">All Articles</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <p className="text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No comments found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-gray-900">{comment.author_name}</div>
                      <div className="text-sm text-gray-500">{comment.author_email}</div>
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Article Link */}
                    <div className="mb-3">
                      <Link
                        href={`/article/${comment.article_id}`}
                        target="_blank"
                        className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                      >
                        <Eye size={14} />
                        {comment.article_title || 'Unknown Article'}
                      </Link>
                    </div>

                    {/* Comment Content */}
                    <div className="text-gray-700 whitespace-pre-wrap">{comment.content}</div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}

