"use client";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { useEffect } from "react";

export default function Navbar() {
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    if (user) {
      const storeUser = async () => {
        try {
          // story in dynamo via backend
          console.log("Attempting to store user:", {
            user_id: user.sub,
            email: user.email,
            name: user.name,
          });

          const response = await fetch("http://localhost:8000/users/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user.sub,
              email: user.email,
              name: user.name,
              picture: user.picture,
              username:
                user.nickname || user.name?.toLowerCase().replace(/\s+/g, "_"),
            }),
          });

          console.log("Response status:", response.status);
          console.log("Response headers:", response.headers);

          if (response.ok) {
            const data = await response.json();
            console.log("User stored in DynamoDB successfully:", data);
          } else {
            const errorText = await response.text();
            console.error("Failed to store user in DynamoDB:", {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
            });
          }
        } catch (error) {
          console.error("Error storing user:", error);
        }
      };

      storeUser();
    }
  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">
            <Link href="/">Fragment</Link>
          </div>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">Fragment</Link>
        </div>

        <div className="flex space-x-4">
          {user ? (
            <>
              <span>Hello, {user.name}!</span>
              <Link
                href="/auth/logout"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Logout
              </Link>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
