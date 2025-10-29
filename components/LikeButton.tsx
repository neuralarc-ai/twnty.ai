'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function LikeButton({ articleId, initialLikes }: { articleId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check localStorage on mount to see if user already liked this article
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
      if (likedArticles.includes(articleId)) {
        setLiked(true);
      }
    }
  }, [articleId]);

  const handleLike = async () => {
    if (liked || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(likes + 1);
        setLiked(true);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
          likedArticles.push(articleId);
          localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
        }
      } else {
        const errorData = await response.json();
        console.error('Error liking article:', errorData);
        alert(errorData.error || 'Failed to like article');
      }
    } catch (error) {
      console.error('Error liking article:', error);
      alert('Failed to like article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 h-[42px] font-medium transition-all whitespace-nowrap rounded-lg ${
        liked 
          ? 'bg-black text-white shadow-sm' 
          : 'bg-gray-50 text-gray-800 hover:bg-gray-200 active:bg-gray-300'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Heart size={18} fill={liked ? 'currentColor' : 'none'} className="flex-shrink-0" />
      <span>{liked ? 'Liked' : 'Like this article'}</span>
      <span className={liked ? 'text-gray-300' : 'text-gray-600'}>({likes})</span>
    </button>
  );
}
