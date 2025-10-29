import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, TABLES } from '@/lib/supabase';
import SafeImage from '@/components/SafeImage';
import { formatDistanceToNow, format } from 'date-fns';
import { notFound } from 'next/navigation';
import LikeButton from '@/components/LikeButton';
import ShareButton from '@/components/ShareButton';
import CommentSection from '@/components/CommentSection';
import { Heart, Eye, Clock, Calendar } from 'lucide-react';
// Rich text content will be rendered directly as HTML


async function getArticle(id: string) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return null;
    }

    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      return null;
    }

    // Increment view count (fire and forget, don't await)
    supabase
      .from(TABLES.ARTICLES)
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)
      .then(() => {}, (err) => console.error('Error updating view count:', err));

    // Map database column names to frontend-friendly names
    return {
      ...data,
      featured_image: data.image_url,
      teaser: data.excerpt,
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export const revalidate = 0;

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  const publishedDate = article.published_at 
    ? format(new Date(article.published_at), 'MMMM dd, yyyy')
    : 'Recently';

  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Article Header */}
          <div className="mb-8">
            {/* Hashtags */}
            {article.hashtags && article.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.hashtags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-black text-white text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{publishedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{readingTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{article.views || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} />
                <span>{article.likes || 0} likes</span>
              </div>
            </div>
          </div>

          {/* Featured Image - Full Width */}
          {article.featured_image && (
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] mb-12 border-2 border-black overflow-hidden">
              <SafeImage
                logsrc={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="max-w-4xl mx-auto mt-8 pb-8" style={{ paddingTop: '2rem' }}>
            <div 
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="article-body prose prose-lg"
              style={{
                fontFamily: 'Georgia, "Palatino Linotype", Palatino, serif',
                fontSize: '1.15rem',
                lineHeight: '1.85',
                color: '#2a2a2a',
                letterSpacing: '0.005em',
                wordSpacing: '0.02em',
                padding: '2rem 3rem',
                background: 'transparent',
              }}
            />
          </div>

          {/* Media Attachments */}
          {(article.media_url || article.audio_url || article.video_url) && (
            <div className="mt-12 p-6 border-2 border-black">
              <h3 className="text-xl font-serif font-bold mb-4">Media</h3>
              {article.media_type === 'audio' && (
                <audio controls className="w-full">
                  <source src={article.media_url || article.audio_url} />
                </audio>
              )}
              {article.media_type === 'video' && (
                <video controls className="w-full">
                  <source src={article.media_url || article.video_url} />
                </video>
              )}
            </div>
          )}

          {/* Article Actions */}
          <div className="flex items-center justify-center gap-6 py-8">
            <div className="flex items-center gap-2 h-[42px] px-5 py-2.5 rounded-lg bg-gray-50 text-gray-600">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">{article.views || 0} views</span>
            </div>
            <LikeButton articleId={article.id} initialLikes={article.likes || 0} />
            <ShareButton articleId={article.id} title={article.title} />
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentSection articleId={article.id} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}