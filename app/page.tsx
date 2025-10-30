import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, isSupabaseConfigured, TABLES } from '@/lib/supabase';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Heart, Clock, BookOpen } from 'lucide-react';

// Helper function to strip HTML tags from teaser
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

async function getPublishedArticles() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Double check environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return [];
    }

    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    // Map database column names to frontend-friendly names
    const mappedArticles = (data || []).map(article => {
      // Filter out blob URLs - they're temporary and won't work for images
      let imageUrl = article.image_url;
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
        console.warn(`⚠️ Article ${article.id} has invalid blob URL: ${imageUrl}`);
        imageUrl = null; // Set to null so placeholder shows instead
      }
      
      return {
        ...article,
        featured_image: imageUrl,
        teaser: article.excerpt,
      };
    });

    // Debug: Log second article image data
    if (mappedArticles.length > 1) {
      const secondArticle = mappedArticles[1];
      console.log('🔍 Second Article Debug:', {
        id: secondArticle.id,
        title: secondArticle.title,
        image_url: secondArticle.image_url,
        featured_image: secondArticle.featured_image,
        hasImage: !!secondArticle.featured_image,
        imageLength: secondArticle.featured_image?.length || 0,
        isBlobUrl: secondArticle.image_url?.startsWith('blob:') || false,
      });
    }

    return mappedArticles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export const revalidate = 60;

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const supabaseConfigured = isSupabaseConfigured();

  // Get the latest article for the featured box
  const featuredArticle = articles[0];
  
  // Get the second latest article for the right side
  const secondArticle = articles[1];
  
  // Get remaining articles for the grid (starting from third article)
  const gridArticles = articles.slice(2);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!supabaseConfigured && (
            <div className="text-center py-20 border-2 border-black p-8">
              <h2 className="text-2xl font-serif font-bold mb-4">Database Not Configured</h2>
              <p className="text-gray-600 mb-4">Please configure your Supabase database to start using the blog.</p>
              <p className="text-sm text-gray-500">See DATABASE_SETUP.md for instructions.</p>
            </div>
          )}

          {supabaseConfigured && articles.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-serif font-bold mb-4">No Articles Yet</h2>
              <p className="text-gray-600">Start creating articles in the admin dashboard!</p>
            </div>
          )}

          {supabaseConfigured && articles.length > 0 && (
            <>
              {/* Featured Article + Second Article Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Featured Article - Large Box (Latest) */}
                {featuredArticle && (
                  <Link 
                    href={`/article/${featuredArticle.id}`}
                    className="lg:col-span-2 group border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 bg-white overflow-hidden flex flex-col"
                  >
                    {featuredArticle.featured_image && (
                      <div className="relative w-full h-80 overflow-hidden">
                        <SafeImage
                          logsrc={featuredArticle.featured_image}
                          alt={featuredArticle.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col">
                      {featuredArticle.hashtags && featuredArticle.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {featuredArticle.hashtags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-black text-white text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="text-3xl font-serif font-bold mb-4 group-hover:underline line-clamp-2">
                        {featuredArticle.title}
                      </h2>
                      {featuredArticle.teaser && (
                        <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">
                          {stripHtmlTags(featuredArticle.teaser)}
                        </p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-600 mt-auto">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {featuredArticle.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {featuredArticle.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredArticle.published_at && formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Second Latest Article - Right Side */}
                {secondArticle && (
                  <Link 
                    href={`/article/${secondArticle.id}`}
                    className="group border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 bg-white overflow-hidden flex flex-col h-full"
                  >
                    {/* Image Section - 50% height */}
                    {secondArticle.featured_image && secondArticle.featured_image.trim() !== '' ? (
                      <div className="relative w-full flex-1 min-h-0 overflow-hidden">
                        <SafeImage
                          logsrc={secondArticle.featured_image.trim()}
                          alt={secondArticle.title || 'Article image'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full flex-1 min-h-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Image not available</span>
                      </div>
                    )}
                    
                    {/* Text Section - 50% height */}
                    <div className="flex-1 min-h-0 p-6 flex flex-col">
                      {secondArticle.hashtags && secondArticle.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {secondArticle.hashtags.slice(0, 2).map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-black text-white text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="text-xl font-serif font-bold mb-3 group-hover:underline line-clamp-2 flex-shrink-0">
                        {secondArticle.title || 'Untitled Article'}
                      </h3>
                      {secondArticle.teaser ? (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                          {stripHtmlTags(secondArticle.teaser)}
                        </p>
                      ) : secondArticle.excerpt ? (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                          {stripHtmlTags(secondArticle.excerpt)}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm mb-4 italic flex-1">
                          No description available
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-600 mt-auto flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {secondArticle.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {secondArticle.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {secondArticle.published_at && formatDistanceToNow(new Date(secondArticle.published_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Remaining Articles Grid */}
              {gridArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridArticles.map((article) => {
                    const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

                    return (
                      <Link
                        key={article.id}
                        href={`/article/${article.id}`}
                        className="border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group overflow-hidden flex flex-col"
                      >
                        {article.featured_image && (
                          <div className="relative w-full h-48 overflow-hidden">
                            <SafeImage
                              logsrc={article.featured_image}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Hashtags */}
                          {article.hashtags && article.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {article.hashtags.map((tag: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-black text-white text-xs font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <h3 className="text-xl font-serif font-bold mb-2 group-hover:underline line-clamp-2">
                            {article.title}
                          </h3>

                          {/* Teaser - Limited to 3 lines */}
                          {article.teaser && (
                            <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-1">
                              {stripHtmlTags(article.teaser)}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-auto">
                            <div className="flex items-center gap-1">
                              <Eye size={14} />
                              <span>{article.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart size={14} />
                              <span>{article.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen size={14} />
                              <span>{readingTime} min read</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}