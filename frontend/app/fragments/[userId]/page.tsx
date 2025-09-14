"use client";

import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
import HeaderSection from "@/app/Components/HeaderSection";
import UserProfileSection from "@/app/Components/UserProfileSection";
import UserResponse from "@/types/UserResponse";
import { useEffect, useState } from "react";
import FragmentNavbar from "@/app/Components/FragmentNavbar";
import MasonryGrid from "@/app/Components/MasonryGrid";
import { useUser } from "@auth0/nextjs-auth0";

export default function ForeignUserPage() {
  const { user } = useUser();  
    const params = useParams();
    const userId = params.userId;

    const [foreignUser, setForeignUser] = useState<UserResponse | null>(null);
    const [gifs, setGifs] = useState([]);

    useEffect(() => {
        if (userId === user?.sub) {
            redirect("/fragments");
            return;
        }
        const fetchUser = async () => {
            const res = await fetch(`http://localhost:8000/users/${userId}`);
            const data = await res.json();
            setForeignUser(data);
        };
        const fetchGifs = async () => {
            const res = await fetch(`http://localhost:8000/users/${userId}/gifs`, {
                cache: "no-store",
            });
            const data = await res.json();
            setGifs(data.gifs || []);
        }
        fetchUser();
        fetchGifs();
    }, [userId, user?.id]);

    if (!foreignUser) {
        return <div className="h-full bg-[#0D0D0D] text-white">Loading...</div>;
    }
    if (!userId) {
        redirect("/fragments");
    }

    return (
        <div className="h-full bg-[#0D0D0D] text-white">
            <HeaderSection />
            <UserProfileSection is_self={false} name={foreignUser.name} username={foreignUser.username || userId} />
            <FragmentNavbar foreignUserId={userId} currrouter="/fragments" />
            <MasonryGrid gifs={gifs || []} />
        </div>
    );
}