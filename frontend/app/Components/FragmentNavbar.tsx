"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUserMinus } from "@fortawesome/free-solid-svg-icons";

export default async function FragmentNavbar({ foreignUserId = null, currrouter }: { foreignUserId?: string | null, currrouter: string }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const is_following = foreignUserId && await fetch(`http://localhost:8000/users/${user?.sub}/is_following`).then(res => res.json()).then(data => data.following.includes(foreignUserId)).catch(() => false);
  const focused = "text-sm text-white border-b-2 border-white pb-2 bg-transparent";
  const unfocused = "text-sm text-gray-400 hover:text-white pb-2 bg-transparent";


  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <nav className="flex gap-8">
        <button
          className={currrouter === "/fragments" ? focused : unfocused}
          onClick={() => foreignUserId ? router.push(`/fragments/${foreignUserId}`) : router.push("/fragments")}
        >
          {currrouter === "/fragments" ? "[FRAGMENTS]" : "FRAGMENTS"}
        </button>
        <button
            className={currrouter === "/collections" ? focused : unfocused}
            onClick={() => foreignUserId ? router.push(`/collections/${foreignUserId}`) : router.push("/collections")}
        >
          {currrouter === "/collections" ? "[COLLECTIONS]" : "COLLECTIONS"}
        </button>
       {!foreignUserId && <button
          className={currrouter === "/following" ? focused : unfocused}
          onClick={() => router.push("/following")}
        >
          {currrouter === "/following" ? "[FOLLOWING]" : "FOLLOWING"}
        </button>}
      </nav>
      <div className="flex gap-3">
        {foreignUserId ? (
          <>
            {is_following ? (
              <button
                className="border border-gray-600 text-red-400 hover:text-white bg-transparent px-4 py-2 rounded text-sm flex items-center gap-2"
                onClick={async () => {
                  try {
                    await fetch(`http://localhost:8000/users/${user?.sub}/follow/${foreignUserId}`, {
                      method: "POST",
                      body: JSON.stringify({ follow: false }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    // Optionally show feedback to user here
                  } catch (e) {
                    console.error("Failed to unfollow user:", e);
                  }
                }}
              >
                <FontAwesomeIcon icon={faUserMinus} />
                Unfollow
              </button>
            ) : (
              <button
                className="border border-gray-600 text-green-400 hover:text-white bg-transparent px-4 py-2 rounded text-sm flex items-center gap-2"
                onClick={async () => {
                  try {
                    await fetch(`http://localhost:8000/users/${user?.sub}/follow/${foreignUserId}`, {
                      method: "POST",
                      body: JSON.stringify({ follow: true }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    // Optionally show feedback to user here
                  } catch (e) {
                    console.error("Failed to follow user:", e);
                  }
                }}
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Follow
              </button>
            )}
          </>
        ) :
        (currrouter === "/fragments" ) && (
          <>
            <button className="border border-gray-600 text-gray-300 hover:text-white bg-transparent px-4 py-2 rounded text-sm">
              Tag
            </button>
            <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded text-sm">
              Create
            </button>
          </>
        )}

        {!foreignUserId  && (isLoading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm">{user.name}</span>
            <Link
              href="/auth/logout"
              className="border border-gray-600 text-gray-300 hover:text-white bg-transparent px-4 py-2 rounded text-sm"
            >
              Logout
            </Link>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded text-sm"
          >
            Login
          </Link>
        ))}
      </div>
    </div>
  );
}
