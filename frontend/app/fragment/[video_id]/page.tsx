"use client";
import { useParams } from "next/navigation";

export default function FragmentPage() {
  const { video_id } = useParams<{ video_id: string }>();
  return (
    <>
      <p>{video_id}</p>
    </>
  );
}
