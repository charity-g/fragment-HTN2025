"use client";

import HeaderSection from "../Components/HeaderSection";
import FragmentNavbar from "../Components/FragmentNavbar";
import UserProfileSection from "../Components/UserProfileSection";
import SearchResultsGrid from "../Components/SearchResultsGrid";
import { useSearch } from "../contexts/SearchContext";

// Regular Following Content
function FollowingContent() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-light mb-8">Following</h1>
      <div className="text-gray-400">
        <p>Content from people you follow will appear here...</p>
        {/* Add your following content here */}
      </div>
    </div>
  );
}

export default function FollowingPage() {
  const { results, searchPerformed } = useSearch();

  return (
    <div className="bg-black min-h-screen text-white">
      <HeaderSection />
      <UserProfileSection is_self={true} />
      <FragmentNavbar currrouter="/following" />

      {/* Conditional rendering - search results OR regular following content */}
      {searchPerformed ? (
        <SearchResultsGrid results={results} />
      ) : (
        <FollowingContent />
      )}
    </div>
  );
}
