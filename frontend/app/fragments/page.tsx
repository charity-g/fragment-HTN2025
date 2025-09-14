import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faCog, faGem } from "@fortawesome/free-solid-svg-icons"

// Import the client component
import MasonryGrid from "../components/MasonryGrid";
import type { gifObject } from "@/types/gifObject";

// Next.js Server Component

export default async function Page() {
  // Fetch GIFs from backend
  const res = await fetch("http://localhost:8000/users/system/gifs", { cache: "no-store" });
  const data = await res.json();
  const gifs: gifObject[] = (data.gifs || []);
  console.log("Fetched GIFs:", gifs);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faGem} className="w-5 h-5" />
          <span className="text-sm  tracking-wider">FRAGMENTS</span>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your fragments"
              className="pl-10 bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-md w-full py-2"
            />
          </div>
        </div>

        <button className="text-gray-400 hover:text-white bg-transparent border-none p-2 rounded">
          <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
        </button>
      </header>

      {/* User Profile Section */}
      <div className="flex items-center gap-4 px-6 py-6">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
          <img src="/diverse-user-avatars.png" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h1
          className="text-[2.5rem] leading-normal"
        >
          Welcome back, Charity
        </h1>
      </div>

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <nav className="flex gap-8">
          <button className="text-sm  text-white border-b-2 border-white pb-2 bg-transparent">[FRAGMENTS]</button>
          <button className="text-sm  text-gray-400 hover:text-white pb-2 bg-transparent">COLLECTIONS</button>
          <button className="text-sm  text-gray-400 hover:text-white pb-2 bg-transparent">FOLLOWING</button>
        </nav>

        <div className="flex gap-3">
          <button className="border border-gray-600 text-gray-300 hover:text-white bg-transparent px-4 py-2 rounded text-sm">Tag</button>
          <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded text-sm">Create</button>
        </div>
      </div>

      <MasonryGrid gifs={gifs} />
    </div>
  )
}


