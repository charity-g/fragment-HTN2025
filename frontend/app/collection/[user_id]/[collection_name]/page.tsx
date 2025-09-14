"use client";

import { useParams, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import MasonryGrid from "@/app/Components/MasonryGrid";
import { gifObject } from "@/types/gifObject";
import HeaderSection from "@/app/Components/HeaderSection";
import FragmentNavbar from "@/app/Components/FragmentNavbar";
import UserProfileSection from "@/app/Components/UserProfileSection";
import { useSearch } from "@/app/contexts/SearchContext";
import SearchResultsGrid from "@/app/Components/SearchResultsGrid";

export default function CollectionPage() {
    const { results, searchPerformed } = useSearch();
    const params = useParams();
    const userId = Array.isArray(params.user_id) ? params.user_id[0] : params.user_id;
    const collectionName = Array.isArray(params.collection_name) ? params.collection_name[0] : params.collection_name;

    if (!userId || !collectionName) {
        redirect("/collections");
    }
    return (
    <div className="h-full bg-[#0D0D0D] text-white">
        <HeaderSection />
        <UserProfileSection is_self={true} />
        <FragmentNavbar currrouter="/collections" />

        {/* Conditional rendering - search results OR regular collections content */}
        {searchPerformed ? (
        <SearchResultsGrid results={results} />
        ) : (
        <CollectionContent userId={userId} collectionName={collectionName} />
        )}
    </div>
    );
}

function CollectionContent({userId, collectionName}: {userId: string, collectionName: string}) {
    const [gifs, setGifs] = useState<gifObject[]>([]);

    useEffect(() => {
        if (!userId || !collectionName) {
            redirect("/collections");
        }
        const fetchGifs = async () => {
            const url = `http://localhost:8000/users/${userId}/gifs?tags=${encodeURIComponent(collectionName)}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json();
            setGifs(data.gifs || []);
        };
        fetchGifs();
    }, [userId, collectionName]);

    if (!collectionName || gifs.length === 0) {
        redirect("/collections/" + userId);
    }
        return (
            <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <h1 className="text-2xl font-bold">Collection:</h1>
        <h2 className="text-xl font-medium text-gray-700">{collectionName}</h2>
      </div>
      <MasonryGrid gifs={gifs} />
    </div>
    );
}
