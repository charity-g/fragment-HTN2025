"use client";

import HeaderSection from "../Components/HeaderSection";
import FragmentNavbar from "../Components/FragmentNavbar";
import UserProfileSection from "../Components/UserProfileSection";
import SearchResultsGrid from "../Components/SearchResultsGrid";
import { useSearch } from "../contexts/SearchContext";

// Regular Collections Content
function CollectionsContent() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-light mb-8">Your Collections</h1>
      <div className="text-gray-400">
        <p>Your collections will appear here...</p>
        {/* Add your collections content here */}
      </div>
    </div>
  );
}

export default function Collections() {
  const { results, searchPerformed } = useSearch();

  return (
    <div className="bg-black min-h-screen text-white">
      <HeaderSection />
      <UserProfileSection is_self={true} />
      <FragmentNavbar currrouter="/collections" />

      {/* Conditional rendering - search results OR regular collections content */}
      {searchPerformed ? (
        <SearchResultsGrid results={results} />
      ) : (
        <CollectionsContent />
      )}
    </div>
  );
}
