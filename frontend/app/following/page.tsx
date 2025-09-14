import FollowingWrapper from "./FollowingContent";

export default async function Page() {
  const res = await fetch("http://localhost:8000/users/system/collections", {
    next: { revalidate: 100 }, // cache for 100 seconds
  });
  const data = await res.json();
  const collections = data.collections || [];

  return <FollowingWrapper collections={collections} />;
}

