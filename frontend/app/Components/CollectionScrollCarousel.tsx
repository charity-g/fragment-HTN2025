// CollectionScrollCarousel.tsx

import React from 'react';
import { useRouter } from 'next/navigation';
import Collection from '@/types/Collection';
import CollectionCard from './CollectionCard';

const CollectionScrollCarousel = ({ collections }: { collections: Collection[] }) => {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 snap-x snap-mandatory px-4">
        {collections.map((collection, id) => (
          <div
            key={id}
            className="snap-start shrink-0 w-[220px]"
            onClick={() => router.push(`/collections/${encodeURIComponent(collection.title)}`)}
          >
            <CollectionCard collection={collection} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionScrollCarousel;
