'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { Edit, Trash2, Eye, Clock, Heart } from 'lucide-react';
import DeleteArticleButton from './DeleteArticleButton';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  image_url?: string;
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  views?: number;
  likes?: number;
  status: string;
}

interface BulkSelectTableProps {
  articles: Article[];
  type: 'scheduled' | 'published';
  baseUrl?: string;
}

export default function BulkSelectTable({ articles, type, baseUrl }: BulkSelectTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(articles.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} article(s)? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/articles/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: Array.from(selectedIds) }),
      });

      if (response.ok) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete articles');
      }
    } catch (error) {
      console.error('Error deleting articles:', error);
      alert('Failed to delete articles');
    } finally {
      setDeleting(false);
    }
  };

  const allSelected = articles.length > 0 && selectedIds.size === articles.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < articles.length;
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="border border-gray-200 bg-white overflow-hidden">
      <div className={`border-b border-gray-200 px-6 py-4 ${type === 'scheduled' ? 'bg-blue-50' : 'bg-green-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'scheduled' ? (
              <Clock className="w-5 h-5 text-blue-600" />
            ) : (
              <Eye className="w-5 h-5 text-green-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {type === 'scheduled' ? 'Scheduled' : 'Published'} Articles ({articles.length})
            </h2>
            {selectedIds.size > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                ({selectedIds.size} selected)
              </span>
            )}
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium rounded disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              {type === 'scheduled' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled For
                  </th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              {type === 'scheduled' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={type === 'scheduled' ? 7 : 7} className="px-6 py-12 text-center text-gray-600">
                  {type === 'scheduled' 
                    ? 'No scheduled articles. Articles will appear here after bulk generation or manual scheduling.'
                    : 'No published articles yet.'
                  }
                </td>
              </tr>
            ) : (
              articles.map((article: Article) => (
                <tr key={article.id} className={`hover:bg-gray-50 ${selectedIds.has(article.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(article.id)}
                      onChange={(e) => handleSelectOne(article.id, e.target.checked)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{article.title}</div>
                    {article.excerpt && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {article.excerpt}
                      </div>
                    )}
                  </td>
                  {type === 'scheduled' ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock size={14} className="text-blue-600" />
                          <div>
                            <div className="font-medium">
                              {article.scheduled_at 
                                ? format(new Date(article.scheduled_at), 'MMM d, yyyy h:mm a')
                                : 'Not scheduled'
                              }
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {article.scheduled_at 
                                ? formatDistanceToNow(new Date(article.scheduled_at), { addSuffix: true })
                                : ''
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-16 h-12 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          <div className="font-medium">
                            {article.published_at 
                              ? format(new Date(article.published_at), 'MMM d, yyyy h:mm a')
                              : 'Not published'
                            }
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {article.published_at 
                              ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                              : ''
                            }
                          </div>
                        </div>
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
                      <td className="px-6 py-4">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-16 h-12 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {type === 'published' && baseUrl && (
                        <a
                          href={`${baseUrl}/article/${article.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye size={18} />
                        </a>
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
  );
}

