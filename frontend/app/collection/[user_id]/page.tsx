"use client";
import { redirect, useParams } from "next/navigation";

export default function Page() {
    const parameters = useParams();
    const user_id = parameters["user_id"];
    redirect(`/collections/${user_id}`);
}