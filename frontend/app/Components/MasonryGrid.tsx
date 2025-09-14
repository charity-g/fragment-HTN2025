"use client";

import React, { useEffect, useState } from 'react';
import GifComponent from './GifComponent';
import type { gifObject } from "@/types/gifObject";

// Accept gifs prop and render images
export default function MasonryGrid({ gifs }: { gifs: gifObject[] }) {
  const [columns, setColumns] = useState(5);

  useEffect(() => {
    function handleResize() {
      setColumns(window.innerWidth < 800 ? 3 : 5);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="p-6">
      <div className="flex gap-4 h-screen items-start">
        {Array.from({ length: columns }).map((_, col) => (
          <div key={col} className="flex flex-col gap-4 flex-1">
            {gifs.filter((_, i) => i % columns === col).map((gif, idx) => (
              <GifComponent key={idx} gif={gif} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
