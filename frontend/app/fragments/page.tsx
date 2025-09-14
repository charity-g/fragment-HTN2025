import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCog, faGem } from "@fortawesome/free-solid-svg-icons";

import MasonryGrid from "../components/MasonryGrid";
import { gifObject } from "@/types/gifObject";
import FragmentNavbar from "../components/FragmentNavbar";
import UserProfileSection from "../components/UserProfileSection";
import HeaderSection from "../components/HeaderSection";

// Next.js Server Component
export default async function Page() {
  // Fetch GIFs from backend
  const res = await fetch("http://localhost:8000/users/system/gifs", {
    cache: "no-store",
  });
  const data = await res.json();
  const gifs: gifObject[] = (data.gifs || []);

  return (
    <div className="min-h-screen h-auto bg-[#0D0D0D] text-white">
      <HeaderSection />

      {/* User Profile Section */}
      <UserProfileSection is_self={true} />

      <FragmentNavbar currrouter="/fragments" />

      <MasonryGrid gifs={gifs} />
    </div>
  );
}
