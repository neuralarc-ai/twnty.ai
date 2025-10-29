'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { Search, X, Eye, Heart, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Helper function to strip HTML tags from teaser
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  featured_image?: string;
  teaser?: string;
  hashtags: string[];
  published_at: string;
  views: number;
  likes: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Search Articles
            </h1>
            <p className="text-gray-600 text-lg">
              Find articles by topic, hashtag, or keyword
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles, topics, or hashtags..."
                className="w-full px-6 py-4 text-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {/* Search Results */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Searching articles...</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12 border-2 border-gray-200 bg-gray-50">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-serif font-bold mb-2">No Results Found</h3>
              <p className="text-gray-600">
                Try different keywords or browse all articles on the homepage
              </p>
              <Link 
                href="/"
                className="inline-block mt-6 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
              >
                Back to Homepage
              </Link>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p className="text-gray-600 mb-6">
                Found {results.length} article{results.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
              
              <div className="grid gap-6">
                {results.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.id}`}
                    className="group border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      {(article.image_url || article.featured_image) && (
                        <div className="md:w-1/3 relative h-64 md:h-auto bg-gray-100">
                          <SafeImage
                            src={article.image_url || article.featured_image || ''}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className={`p-6 ${(article.image_url || article.featured_image) ? 'md:w-2/3' : 'w-full'}`}>
                        {/* Hashtags */}
                        {article.hashtags && article.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.hashtags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-black text-white text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Title */}
                        <h2 className="text-2xl font-serif font-bold mb-3 group-hover:underline">
                          {article.title}
                        </h2>

                        {/* Excerpt/Teaser */}
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {stripHtmlTags(article.excerpt || article.teaser || '')}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {article.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}