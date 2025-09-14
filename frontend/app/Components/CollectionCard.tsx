import React from 'react';
import { useRouter } from "next/navigation";
import Collection from '@/types/Collection';

const CollectionCard: React.FC<{ collection: Collection}> = ({ collection }) => {
  const router = useRouter();
  return (
    <div
      className="rounded-lg bg-transparent shadow-none overflow-hidden cursor-pointer"
      onClick={() => router.replace(`/collections/${encodeURIComponent(collection.title)}`)}
    >
      <div className="aspect-square bg-transparent flex items-center justify-center">
        <img
          src={collection.gif_url}
          alt={collection.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="py-4 text-left">
        <h3 className="text-lg font-semibold">{collection.title}</h3>
        <p className="text-sm text-gray-500">
          {collection.count} fragments • {collection.privacy}
        </p>
      </div>
    </div>
  );
}

export default  CollectionCard;