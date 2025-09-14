"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCog, faGem } from "@fortawesome/free-solid-svg-icons";
import { useSearch } from "../contexts/SearchContext";
import SearchResultsGrid from "../Components/SearchResultsGrid";
import { Fragment, useEffect, useState } from "react";
import UserProfileSection from "../Components/UserProfileSection";

import FragmentNavbar from "../Components/FragmentNavbar";
import HeaderSection from "../Components/HeaderSection";
import MasonryGrid from "../Components/MasonryGrid";
import { gifObject } from "@/types/gifObject";

// Regular Fragments Content
function FragmentsContent() {
  const [gifs, setGifs] = useState<gifObject[]>([]);

  useEffect(() => {
    const fetchGifs = async () => {
      try {
        const res = await fetch("http://localhost:8000/users/system/gifs", {
          cache: "no-store",
        });
        const data = await res.json();
        const gifUrls: gifObject[] = (data.gifs || []);
        setGifs(gifUrls);
      } catch (error) {
        console.error("Failed to fetch gifs:", error);
      }
    };
    fetchGifs();
  }, []);

  return (
      <MasonryGrid gifs={gifs} />
  );
}


export default function Page() {
  const { results, searchPerformed } = useSearch();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <HeaderSection />
      <UserProfileSection is_self={true} />
      <FragmentNavbar currrouter="/fragments" />
      {/* Conditional rendering - search results OR regular fragments content */}
      {searchPerformed ? (
        <SearchResultsGrid results={results} />
      ) : (
        <FragmentsContent />
      )}
    </div>
  );
}
