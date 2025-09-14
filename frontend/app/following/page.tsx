import HeaderSection from "../components/HeaderSection";
import FragmentNavbar from "../components/FragmentNavbar";

// Next.js Server Component

export default function FollowingPage() {
    return (
      <div className="bg-black min-h-screen text-white">
        <HeaderSection  />
        <FragmentNavbar currrouter="/following" />
      </div>
    );
  }