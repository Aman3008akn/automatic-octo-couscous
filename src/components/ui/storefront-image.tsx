"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

type StorefrontImageProps = Omit<ImageProps, "onError"> & {
  fallbackUrl?: string;
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop";

export function StorefrontImage({
  src,
  alt,
  fallbackUrl = DEFAULT_FALLBACK,
  className = "",
  ...props
}: StorefrontImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      {...props}
      src={hasError ? fallbackUrl : imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        setHasError(true);
        setImgSrc(fallbackUrl);
      }}
    />
  );
}
