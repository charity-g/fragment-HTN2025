"use client";

import { useRef, useEffect } from "react";
import type { gifObject } from "@/types/gifObject";

export default function GifComponent({ gif }: { gif: gifObject }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => {
      video.play();
    };

    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg flex items-center justify-center">
      {gif.gif_url && (
        <img
          src={gif.gif_url}
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
          className="rounded"
          alt={'gif'}
        />
      )}
    </div>
  );
}