"use client";

import { useEffect, useState } from "react";
import HeaderSection from "../../Components/HeaderSection";
import FragmentNavbar from "../../Components/FragmentNavbar";
import UserProfileSection from "../../Components/UserProfileSection";
import SearchResultsGrid from "../../Components/SearchResultsGrid";
import { useSearch } from "../../contexts/SearchContext";
import CollectionGrid from "../../Components/CollectionGrid";

import Collection from "@/types/Collection";
import { redirect, useParams } from "next/navigation";
import UserResponse from "@/types/UserResponse";
import { useUser } from "@auth0/nextjs-auth0";

// Regular Collections Content
function CollectionsContent({collections}: {collections: Collection[]}) {
  const { results, searchPerformed } = useSearch();
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-light mb-8">Your Collections</h1>
      
      {/* Conditional rendering - search results OR regular collections content */}
      {searchPerformed ? (
        <SearchResultsGrid results={results} />
      ) : (collections.length === 0) ? (
      <div className="text-gray-400">
        <p>Your collections will appear here...</p>
      </div> ) : ( 
        <CollectionGrid collections={collections} />
      )}
    </div>
  );
}

export default function Collections() {
  const { results, searchPerformed } = useSearch();
     const { user } = useUser();   
    const params = useParams();
    const userId = params.user_id; // useParams() returns an object with keys matching your dynamic route segments
    
    const [foreignUser, setForeignUser] = useState<UserResponse | null>(null);
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(`http://localhost:8000/users/${userId}`);
            const data = await res.json();
            setForeignUser(data);
        };
        const fetchCollections = async () => {
            const res = await fetch(`http://localhost:8000/users/${userId}/collections`, {
                cache: "no-store",
            });
            const data = await res.json();
            setCollections(data.collections || []);
        }
        fetchUser();
        fetchCollections();
    }, [userId, user?.id]);



    if (!foreignUser) {
        return <div className="h-full bg-[#0D0D0D] text-white">Loading...</div>;
    }
    if (!userId || userId === user?.sub) {
        redirect("/collections");
    }
  return (
    <div className="h-full bg-[#0D0D0D] text-white">
      <HeaderSection />
      <UserProfileSection is_self={false} />
      <FragmentNavbar foreignUserId={typeof userId === "string" ? userId : userId[0]} currrouter="/collections" />

      {/* Conditional rendering - search results OR regular collections content */}
      {searchPerformed ? (
        <SearchResultsGrid results={results} />
      ) : (
        <CollectionsContent collections={collections} />
      )}
    </div>
  );
}
