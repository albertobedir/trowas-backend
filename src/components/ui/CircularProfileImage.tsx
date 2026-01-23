"use client";

import Image from 'next/image';
import { useState } from 'react';
import { getBlurBackgroundStyles } from '@/utils/imageUtils';

interface CircularProfileImageProps {
  src: string;
  alt: string;
  size: number | string;
  priority?: boolean;
  bgColor?: string;
  className?: string;
}

/**
 * A component for displaying circular profile images without black edges
 * Uses a blurred background of the same image to fill any gaps
 */
export function CircularProfileImage({
  src,
  alt,
  size,
  priority = false,
  bgColor = "#ffffff",
  className = "",
}: CircularProfileImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        backgroundColor: bgColor,
      }}
    >      {/* Blurred background layer */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          filter: 'blur(8px)',
          opacity: 0.9,
          transform: 'scale(1.2)',
        }}
      >
        <Image
          src={src}
          alt={`${alt} background`}
          width={typeof size === 'number' ? size * 1.2 : 100}
          height={typeof size === 'number' ? size * 1.2 : 100}
          sizes="100%"
          className="object-cover w-full h-full"
          priority={priority}
        />
      </div>

      {/* Main image layer */}
      <Image
        src={src}
        alt={alt}
        width={typeof size === 'number' ? size : 100}
        height={typeof size === 'number' ? size : 100}
        sizes="100%"
        className={`object-cover w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        priority={priority}
      />
    </div>
  );
}
