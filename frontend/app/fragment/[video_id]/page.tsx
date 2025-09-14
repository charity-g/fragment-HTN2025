"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import logo from "@/app/src/images/logo.svg";

export default function FragmentPage() {
  const params = useParams();
  const video_id = params["video_id"];
  const router = useRouter();

  const [gifData, setGifData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/opensearch/video/${video_id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setError(`Error fetching video ${video_id}`);
          return;
        }
        const data = await res.json();
        setGifData(data.document._source);
        
      } catch (e) {
        setError("Error fetching video data");
      }
    };
    fetchData();
  }, [video_id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (!gifData) {
    return <p className="text-gray-400">Loading...</p>;
  }

  const abs_gif_link = "https://fragment-gifs.s3.amazonaws.com/" + gifData.gif_link;

  return (
    <main className="bg-[#0f0f0f] text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src={logo}
            alt="Logo"
            width={32}
            height={32}
            style={{ filter: "invert(1)" }}
          />
          <span className="text-lg font-bold tracking-wide">FRAGMENTS</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex gap-8 w-full max-w-7xl mx-auto p-6">
        {/* Left: Video/GIF */}
        <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-xl flex items-center justify-center">
          <img
            src={abs_gif_link}
            alt="fragment gif"
            className="w-full h-[70vh] object-contain"
          />
        </div>

        {/* Right: Metadata Panel */}
        <aside className="w-[360px] bg-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
          {/* Top Bar */}
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-300 truncate">
              {gifData.user_id || "unknown"}
            </span>
            <button className="text-gray-400 hover:text-gray-200">✕</button>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              COLLECTION
            </label>
            <select
              defaultValue={gifData.collection || ""}
              className="w-full bg-[#2a2a2a] rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              <option>{gifData.collection || "Inspiration"}</option>
            </select>
          </div>

          {/* Tags */}
          {gifData.tags && gifData.tags.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                TAG
              </label>
              <div className="flex flex-wrap gap-2">
                {gifData.tags
                  .filter((t: string) => t && t.trim() !== "")
                  .map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-black rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              NOTES
            </label>
            <textarea
              defaultValue={gifData.description || ""}
              placeholder="Add notes..."
              className="w-full bg-[#2a2a2a] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
              rows={3}
            />
          </div>

          {/* How it's made (editingInstructions) */}
          {gifData.editingInstructions && (
            <details className="bg-[#141414] rounded-lg p-4 text-sm text-gray-300">
              <summary className="cursor-pointer font-medium text-white">
                HOW IT’S MADE ✨
              </summary>
              <p className="mt-2 text-gray-400 whitespace-pre-line">
                {gifData.editingInstructions}
              </p>
            </details>
          )}

          {/* Original Source URL */}
          {gifData.sourceURL && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                ORIGINAL
              </label>
              <a
                href={gifData.sourceURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-words text-sm"
              >
                {gifData.sourceURL}
              </a>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-auto">
            <button className="flex-1 border border-gray-500 rounded-full py-2 text-sm hover:bg-gray-700 transition">
              {gifData.is_public ? "🌐 Public" : "🔒 Private"}
            </button>
            <button className="flex-1 bg-white text-black rounded-full py-2 text-sm font-semibold hover:bg-gray-200 transition">
              Edit Fragment
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
