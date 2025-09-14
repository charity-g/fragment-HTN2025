export default interface Collection {
  title: string;
  count?: number;
  gif_url: string;
  user_id: string;
  privacy: "Private" | "Public";
} Collection;