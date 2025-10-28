import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, TABLES } from '@/lib/supabase';
import Image from 'next/image';
import { formatDistanceToNow, format } from 'date-fns';
import { notFound } from 'next/navigation';
import LikeButton from '@/components/LikeButton';
import ShareButton from '@/components/ShareButton';
import CommentSection from '@/components/CommentSection';
import { Heart, Eye, Clock, Calendar } from 'lucide-react';

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from(TABLES.ARTICLES)
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }

  // Increment view count
  await supabase
    .from(TABLES.ARTICLES)
    .update({ views: (data.views || 0) + 1 })
    .eq('id', id);

  return data;
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
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
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="article-content prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
              className="text-lg leading-relaxed"
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
          <div className="flex items-center justify-center gap-6 py-8 border-y border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
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