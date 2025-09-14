import HeaderSection from "../components/HeaderSection";
import FragmentNavbar from "../components/FragmentNavbar";
import UserProfileSection from "../components/UserProfileSection";

// Next.js Server Component

export default function Collections() {
    return (
      <div className="bg-black min-h-screen text-white">
        <HeaderSection  />
                <UserProfileSection is_self={true}/>
        <FragmentNavbar currrouter="/collections" />
      </div>
    );
  }