'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function LikeButton({ articleId, initialLikes }: { articleId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

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
        setLikes(likes + 1);
        setLiked(true);
      }
    } catch (error) {
      console.error('Error liking article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={`flex items-center space-x-2 px-6 py-3 border-2 border-black font-medium transition-all ${
        liked 
          ? 'bg-black text-white' 
          : 'bg-white text-black hover:bg-black hover:text-white'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
      <span>{liked ? 'Liked' : 'Like this article'}</span>
      <span className="ml-2">({likes})</span>
    </button>
  );
}