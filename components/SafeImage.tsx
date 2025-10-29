'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  logsrc?: string;
  src?: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}

export default function SafeImage({ 
  logsrc, 
  src,
  alt, 
  fill, 
  className = '', 
  priority = false,
  width,
  height,
  sizes
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = logsrc || src || '';

  // Validate that imageSrc is a valid, non-empty URL
  const isValidUrl = imageSrc && 
    imageSrc.trim() !== '' && 
    (imageSrc.startsWith('http://') || 
     imageSrc.startsWith('https://') || 
     imageSrc.startsWith('/') ||
     imageSrc.startsWith('data:'));

  if (!isValidUrl || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}>
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  const commonProps = {
    alt,
    className,
    priority,
    onError: () => setImageError(true),
  };

  if (fill) {
    return (
      <Image
        {...commonProps}
        src={imageSrc}
        fill
        sizes={sizes || '100vw'}
        unoptimized={imageSrc.startsWith('http') && !imageSrc.includes('supabase.co')}
        onError={() => {
          console.error('Failed to load image:', imageSrc);
          setImageError(true);
        }}
      />
    );
  }

  if (width && height) {
    return (
      <Image
        {...commonProps}
        src={imageSrc}
        width={width}
        height={height}
        sizes={sizes}
        unoptimized={imageSrc.startsWith('http') && !imageSrc.includes('supabase.co')}
        onError={() => {
          console.error('Failed to load image:', imageSrc);
          setImageError(true);
        }}
      />
    );
  }

  return null;
}

