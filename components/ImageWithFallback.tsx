"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f7f3ee' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23635c5c' font-family='sans-serif' font-size='16'%3EImage%3C/text%3E%3C/svg%3E";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  /** Next/Image compression (default 90 for sharper product photos; was implicit 75). */
  quality?: number;
  /** Hint for responsive image sizes; improves LCP when set for above-the-fold images. */
  sizes?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  priority,
  quality = 90,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const effectiveSrc = error ? FALLBACK_SRC : src;

  if (fill) {
    return (
      <Image
        src={effectiveSrc}
        alt={alt}
        fill
        className={className}
        onError={() => setError(true)}
        priority={priority}
        quality={quality}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      className={className}
      onError={() => setError(true)}
      priority={priority}
      quality={quality}
    />
  );
}
