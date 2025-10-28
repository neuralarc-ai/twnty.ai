'use client';

import { X, Eye, Heart, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
// Rich text content will be rendered directly as HTML

interface ArticlePreviewModalProps {
  isOpen?: boolean;
  onClose: () => void;
  article: {
    title: string;
    content: string;
    teaser: string;
    featured_image: string;
    hashtags: string[];
    audio_url?: string;
    video_url?: string;
    external_links?: string[];
  };
}

export default function ArticlePreviewModal({ 
  isOpen = true,
  onClose, 
  article 
}: ArticlePreviewModalProps) {
  if (!isOpen) return null;

  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);
  const publishedDate = format(new Date(), 'MMMM dd, yyyy');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto border-4 border-black shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b-2 border-black px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <Eye size={24} />
              <h2 className="text-xl font-serif font-bold">Article Preview</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close preview"
            >
              <X size={24} />
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-8">
            {/* Featured Image */}
            {article.featured_image && (
              <div className="relative w-full h-96 mb-8 border-2 border-black overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Article Header */}
            <div className="mb-8">
              {/* Hashtags */}
              {article.hashtags && article.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black text-white text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{publishedDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto pb-8" style={{ paddingTop: '2rem' }}>
              <div 
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="article-body prose prose-lg"
                style={{
                  fontFamily: 'Georgia, "Palatino Linotype", Palatino, serif',
                  fontSize: '1.3rem',
                  lineHeight: '1.85',
                  color: '#2a2a2a',
                  letterSpacing: '0.005em',
                  wordSpacing: '0.02em',
                  padding: '2rem 3rem',
                  background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              />
            </div>

            {/* Media */}
            {article.audio_url && (
              <div className="mt-8 border-2 border-black p-6">
                <h3 className="text-xl font-serif font-bold mb-4">Audio</h3>
                <audio controls className="w-full">
                  <source src={article.audio_url} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {article.video_url && (
              <div className="mt-8 border-2 border-black p-6">
                <h3 className="text-xl font-serif font-bold mb-4">Video</h3>
                <video controls className="w-full">
                  <source src={article.video_url} />
                  Your browser does not support the video element.
                </video>
              </div>
            )}

            {/* External Links */}
            {article.external_links && article.external_links.length > 0 && (
              <div className="mt-8 border-2 border-black p-6">
                <h3 className="text-xl font-serif font-bold mb-4">Related Links</h3>
                <ul className="space-y-2">
                  {article.external_links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:opacity-70 transition-opacity"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t-2 border-black px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                This is how your article will appear to readers
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}