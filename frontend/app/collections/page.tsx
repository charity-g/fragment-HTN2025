import HeaderSection from "../components/HeaderSection";
import FragmentNavbar from "../components/FragmentNavbar";
import UserProfileSection from "../components/UserProfileSection";
import CollectionGrid from "../components/CollectionGrid";

import Collection from "@/types/Collection";
// Next.js Server Component

export default async function Collections() {
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
      <HeaderSection  />
      <UserProfileSection is_self={true}/>
        <FragmentNavbar currrouter="/collections" />
        <CollectionGrid collections={collections} />
      </div>
    );
  }

