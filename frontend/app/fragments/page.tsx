import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faCog, faGem } from "@fortawesome/free-solid-svg-icons"

// Import the client component
import MasonryGrid from "../components/MasonryGrid";
import HeaderSection from "../components/HeaderSection";
import FragmentNavbar from "../components/FragmentNavbar";
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
      <HeaderSection />

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

      <FragmentNavbar current="/fragments" />

      <MasonryGrid gifs={gifs} />
    </div>
  )
}


