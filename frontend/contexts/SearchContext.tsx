"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SearchResult {
  video_id: string;
  tags: string[];
  description: string;
  gif_link: string;
  _score: number;
  highlight?: {
    tags?: string[];
    description?: string[];
  };
}

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  searchPerformed: boolean;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setSearchPerformed(true);

    try {
      const response = await fetch(
        `http://localhost:8000/opensearch/search-system?q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setResults(data.documents || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchPerformed(false);
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        isSearching,
        searchPerformed,
        performSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
