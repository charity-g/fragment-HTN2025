"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useEffect } from "react";

export function useAuth() {
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    if (user) {
      const storeUser = async () => {
        try {
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

  return {
    user,
    error,
    isLoading,
  };
}
