import Image from "next/image";
import avatar from "@/public/avatar.jpg";

export default function UserProfileSection({name, username, is_self}: {name?: string, username?: string, is_self: boolean}) {
    if (!is_self) {
        return (
      <div className="flex items-center gap-4 px-6 py-6">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
          <Image src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
        <h1
          className="text-[2.5rem] leading-normal"
        > 
        {name ? name : "User Not Found"}
        </h1>
        <p className="text-gray-400 text-sm">@
        {username ? username : "handle-not-found"}</p>
        </div>
      </div>
    )
    }
    return (
      <div className="flex items-center gap-4 px-6 py-6">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
          <Image src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h1
          className="text-[2.5rem] leading-normal"
        >
          Welcome back, {name ? name : "Dreamer"}
        </h1>
      </div>
    )
}