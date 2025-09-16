import FollowingWrapper from "./FollowingContent";

type userToFollowObject = {
  user_id: string;
  gif_link: string;
  tags: string[];
  privacy: string;
};

export default async function Page() {
  let data;
  try {
    const res = await fetch("http://localhost:8000/opensearch/non-matching-user?user_id=system", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    data = await res.json();
  } catch {
    data = { documents: [] };
  }
  const videos = data.documents.map((doc: userToFollowObject) => ({
    title: doc.tags[0] || "Untitled",
    gif_url: `https://fragment-gifs.s3.amazonaws.com/${encodeURIComponent(doc.gif_link || "")}`,
    privacy: doc.privacy,
    user_id: doc.user_id,
  })) || [];

  return <FollowingWrapper collections={videos} />;
}

