'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function ShareButton({ articleId, title }: { articleId: string; title: string }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const articleUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/article/${articleId}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all"
        aria-label="Share article"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-medium">Share</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Share Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-black shadow-lg z-50">
            <div className="p-4 space-y-2">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="font-medium">Copy Link</span>
                  </>
                )}
              </button>

              <div className="border-t border-gray-200 my-2" />

              {/* Social Share Buttons */}
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <Twitter className="w-5 h-5" />
                <span className="font-medium">Share on Twitter</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <Linkedin className="w-5 h-5" />
                <span className="font-medium">Share on LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <Facebook className="w-5 h-5" />
                <span className="font-medium">Share on Facebook</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}