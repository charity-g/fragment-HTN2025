"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import Collection from '@/types/Collection';

const CollectionCard: React.FC<{ collection: Collection}> = ({ collection }) => {
  const router = useRouter();
  return (
    <div
      className="rounded-lg bg-transparent shadow-none overflow-hidden cursor-pointer"
      onClick={() => router.replace(`/collections/${collection.user_id}/${encodeURIComponent(collection.title)}`)}
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
        {collection.user_id ? ( <p className="text-sm text-gray-500">
         @{collection.user_id} • {collection.count || "Collection of"} fragments 
        </p>) : (
          <p className="text-sm text-gray-500">
            {collection.count || "Collection of"} fragments • {collection.privacy}
          </p>
        )}
      </div>
    </div>
  );
}

export default  CollectionCard;