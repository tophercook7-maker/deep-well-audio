"use client";

import { useCallback, useState } from "react";
import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Outer wrapper (layout, rounded corners, aspect ratio). */
  className?: string;
  /** Applied to the img (object-fit, hover, sizing). */
  imgClassName?: string;
  loading?: "lazy" | "eager";
};

/**
 * Remote podcast/show artwork with client-side fallback when URL is missing or the image fails to load.
 * Uses a native img so any RSS CDN works without prior Next image hostname registration.
 */
export function RemoteArtwork({ src, alt, className = "", imgClassName = "", loading = "lazy" }: Props) {
  const remote = normalizeArtworkSrc(src);
  const [failed, setFailed] = useState(false);
  const displaySrc = !remote || failed ? FALLBACK_ARTWORK_PATH : remote;

  const onError = useCallback(() => {
    setFailed(true);
  }, []);

  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- intentional: RSS hosts + onError fallback */}
      <img
        src={displaySrc}
        alt={alt}
        className={imgClassName}
        loading={loading}
        decoding="async"
        onError={onError}
      />
    </div>
  );
}
