import Link from "next/link";

export default async function FragmentPage({ params }: { params: { video_id: string } }) {
  const { video_id } = params;

  // Fetch video data
  const res = await fetch(`http://localhost:8000/opensearch/video/${video_id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <p>Error fetching video {video_id}</p>;
  }

  const data = await res.json();

  return (
    <main className="bg-[#0f0f0f] text-white min-h-screen flex justify-center items-start p-6">
      <div className="flex gap-6 w-full max-w-7xl">
        {/* Left: Video */}
        <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-lg">
          <video
            src={data.playback_url}
            controls
            className="w-full h-[70vh] object-contain"
          />
        </div>

        {/* Right: Metadata Panel */}
        <Linkside className="w-[340px] bg-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
          {/* Top Bar */}
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span className="font-medium text-white">youtube</span>
            <button className="hover:text-gray-200">✕</button>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              COLLECTION
            </label>
            <select
              defaultValue="Baking Inspo"
              className="w-full bg-[#2a2a2a] rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              <option>Baking Inspo</option>
              <option>Motion</option>
              <option>Editing</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              TAG
            </label>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-black rounded-full text-sm">Baking ✕</span>
              <span className="px-3 py-1 bg-black rounded-full text-sm">Cookies ✕</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              NOTES
            </label>
            <textarea
              defaultValue="Fire recipe I wanna try"
              className="w-full bg-[#2a2a2a] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
              rows={3}
            />
          </div>

          {/* How it's made */}
          <details className="bg-[#141414] rounded-lg p-4 text-sm text-gray-300">
            <summary className="cursor-pointer font-medium text-white">
              HOW IT’S MADE ✨
            </summary>
            <p className="mt-2 text-gray-400">
              This effect is called a flash cut. It’s done by trimming 2–3 frames out of
              the clip, creating a jarring transition. Here’s how you can replicate it in{" "}
              <Link href="#" className="underline hover:text-white">
                Premiere
              </Link>
              .
            </p>
          </details>

          {/* Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-500 rounded-full py-2 text-sm hover:bg-gray-700 transition">
              🔒 Private
            </button>
            <button className="flex-1 bg-white text-black rounded-full py-2 text-sm font-semibold hover:bg-gray-200 transition">
              Edit Fragment
            </button>
          </div>
        </Linkside>
      </div>
    </main>
  );
}
