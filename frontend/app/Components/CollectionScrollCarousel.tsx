// CollectionScrollCarousel.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Collection from '@/types/Collection';
import CollectionCard from './CollectionCard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const CollectionScrollCarousel = ({ collections }: { collections: Collection[] }) => {
  const router = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  return (
    <div className="relative m-10 flex gap-x-4 items-center justify-center">
      <button
        className="-translate-y-14 z-10 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition"
        onClick={scrollLeft}
        aria-label="Scroll left"
        style={{ outline: "none" }}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-2xl" />
      </button>
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch", maxWidth: "920px" }} // 4 cards * 220px + gaps
      >
        <div className="flex space-x-6 snap-x snap-mandatory px-4">
          {collections.map((collection, id) => (
            <div
              key={id}
              className="snap-start shrink-0 w-[220px]"
              onClick={() => router.push(`/collections/${collection.user_id}/${encodeURIComponent(collection.title)}`)}
            >
              <CollectionCard collection={collection} />
            </div>
          ))}
        </div>
      </div>
      <button
        className="-translate-y-14 z-10 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition"
        onClick={scrollRight}
        aria-label="Scroll right"
        style={{ outline: "none" }}
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-2xl" />
      </button>
    </div>
  );
};

export default CollectionScrollCarousel;
