
import HeaderSection from "../Components/HeaderSection";
import FragmentNavbar from "../Components/FragmentNavbar";
import UserProfileSection from "../Components/UserProfileSection";
import SearchResultsGrid from "../Components/SearchResultsGrid";
import { useSearch } from "../contexts/SearchContext";
import CollectionCarousel from "../Components/CollectionScrollCarousel";

// Regular Following Content
async function FollowingContent() {
    let collections = await fetch(`http://localhost:8000/users/system/collections`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    }).then(res => res.json()).then(data => data.collections || []);


  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-light mb-8">Following</h1>
      <div className="text-gray-400">
        <p>Content from people you follow will appear here...</p>

        
        <CollectionCarousel collections={collections} />
      </div>
    </div>
  );
}

export default function FollowingPage() {
  const { results, searchPerformed } = useSearch();

  return (
    <div className="bg-[#0D0D0D] min-h-screen text-white">
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
