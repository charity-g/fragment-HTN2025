"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCog, faGem } from "@fortawesome/free-solid-svg-icons";
import { useSearch } from "../contexts/SearchContext";

export default function HeaderSection() {
  const { query, setQuery, performSearch, isSearching } = useSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faGem} className="w-5 h-5" />
        <span className="text-sm tracking-wider">FRAGMENTS</span>
      </div>
      <div className="flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your fragments"
            className="pl-10 bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-md w-full py-2 focus:outline-none focus:border-gray-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
          )}
        </form>
      </div>
      <button className="text-gray-400 hover:text-white bg-transparent border-none p-2 rounded">
        <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
      </button>
    </header>
  );
}
