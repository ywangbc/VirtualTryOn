"use client";

import { useEffect, useRef } from "react";

type ClipPlayerProps = {
  src: string;
  poster: string;
  playing: boolean;
};

export function ClipPlayer({ src, poster, playing }: ClipPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (!playing) {
      video.pause();
      return;
    }

    const tryPlay = () => {
      void video.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
      return;
    }

    video.addEventListener("canplay", tryPlay, { once: true });
    return () => {
      video.removeEventListener("canplay", tryPlay);
    };
  }, [playing]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  );
}
