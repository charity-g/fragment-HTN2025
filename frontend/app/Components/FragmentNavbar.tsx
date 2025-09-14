"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";


export default function FragmentNavbar({ is_self, currrouter }: { is_self: boolean, currrouter: string }) {
  const router = useRouter();
  const focused = "text-sm text-white border-b-2 border-white pb-2 bg-transparent";
  const unfocused = "text-sm text-gray-400 hover:text-white pb-2 bg-transparent";
  const { user, isLoading } = useAuth();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <nav className="flex gap-8">
        <button
          className={currrouter === "/fragments" ? focused : unfocused}
          onClick={() => is_self ? router.push("/fragments") : router.push(`/fragments/${user.id}`)}
        >
          {currrouter === "/fragments" ? "[FRAGMENTS]" : "FRAGMENTS"}
        </button>
        <button
            className={currrouter === "/collections" ? focused : unfocused}
            onClick={() => is_self ? router.push("/collections") : router.push(`/collections/${user.id}`)}
        >
          {currrouter === "/collections" ? "[COLLECTIONS]" : "COLLECTIONS"}
        </button>
       {is_self && <button
          className={currrouter === "/following" ? focused : unfocused}
          onClick={() => router.push("/following")}
        >
          {currrouter === "/following" ? "[FOLLOWING]" : "FOLLOWING"}
        </button>}
      </nav>
      <div className="flex gap-3">
        {currrouter === "/fragments" && is_self && (
          <>
            <button className="border border-gray-600 text-gray-300 hover:text-white bg-transparent px-4 py-2 rounded text-sm">
              Tag
            </button>
            <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded text-sm">
              Create
            </button>
          </>
        )}

        {isLoading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm">{user.name}</span>
            <a
              href="/auth/logout"
              className="border border-gray-600 text-gray-300 hover:text-white bg-transparent px-4 py-2 rounded text-sm"
            >
              Logout
            </a>
          </div>
        ) : (
          <a
            href="/auth/login"
            className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded text-sm"
          >
            Login
          </a>
        )}
      </div>
    </div>
  );
}
