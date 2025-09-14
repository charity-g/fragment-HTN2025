"use client";

import HeaderSection from "../Components/HeaderSection";
import FragmentNavbar from "../Components/FragmentNavbar";
import UserProfileSection from "../Components/UserProfileSection";
import SearchResultsGrid from "../Components/SearchResultsGrid";
import { useSearch } from "../contexts/SearchContext";
import CollectionGrid from "../Components/CollectionGrid";

import Collection from "@/types/Collection";

// Regular Collections Content
function CollectionsContent({collections}: {collections: Collection[]}) {
  const { results, searchPerformed } = useSearch();
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-light mb-8">Your Collections</h1>
      <div className="text-gray-400">
        <p>Your collections will appear here...</p>
        {/* Add your collections content here */}
      </div>
      
      {/* Conditional rendering - search results OR regular collections content */}
      {searchPerformed ? (
        <SearchResultsGrid results={results} />
      ) : (
        <CollectionGrid collections={collections} />
      )}
    </div>
  );
}

export default async function Collections() {
  const { results, searchPerformed } = useSearch();
  const user_id = 'system';
  const tagsEndpoint = `/users/${user_id}/collections`;
  const res = await fetch(`http://localhost:8000${tagsEndpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store"
  });
  const data = await res.json();
  const collections: Collection[] = data.collections || [];

  return (
    <div className="h-full bg-[#0D0D0D] text-white">
      <HeaderSection />
      <UserProfileSection is_self={true} />
      <FragmentNavbar currrouter="/collections" />

      {/* Conditional rendering - search results OR regular collections content */}
      {searchPerformed ? (
        <SearchResultsGrid results={results} />
      ) : (
        <CollectionsContent collections={collections} />
      )}
    </div>
  );
}
