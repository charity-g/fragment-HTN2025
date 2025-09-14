"use client";
import { useRouter } from "next/navigation";

export default function FragmentNavbar({ currrouter }: { currrouter: string }) {
    const focused = "text-sm text-white border-b-2 border-white pb-2 bg-transparent";
    const unfocused = "text-sm text-gray-400 hover:text-white pb-2 bg-transparent";
    const router = useRouter();
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <nav className="flex gap-8">
          <button
            className={currrouter === "/fragments" ? focused : unfocused}
            onClick={() => router.push("/fragments")}
          >
            {currrouter === "/fragments" ? "[FRAGMENTS]" : "FRAGMENTS"}
          </button>
          <button
            className={currrouter === "/collections" ? focused : unfocused}
            onClick={() => router.push("/collections")}
          >
            {currrouter === "/collections" ? "[COLLECTIONS]" : "COLLECTIONS"}
          </button>
          <button
            className={currrouter === "/following" ? focused : unfocused}
            onClick={() => router.push("/following")}
          >
            {currrouter === "/following" ? "[FOLLOWING]" : "FOLLOWING"}
          </button>
        </nav>

        <div className="flex gap-3">
          <button className="border border-gray-600 text-gray-300 hover:text-white bg-transparent px-4 py-2 rounded text-sm">Tag</button>
          <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded text-sm">Create</button>
        </div>
      </div>
    )
}