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

  const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='18'%3EImage not available%3C/text%3E%3C/svg%3E`;

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
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
      />
    );
  }

  return null;
}

