// Import the client component
import MasonryGrid from "../components/MasonryGrid";
import HeaderSection from "../components/HeaderSection";
import FragmentNavbar from "../components/FragmentNavbar";
import UserProfileSection from "../components/UserProfileSection";
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

      <UserProfileSection />

      <FragmentNavbar currrouter="/fragments" />

      <MasonryGrid gifs={gifs} />
    </div>
  )
}


