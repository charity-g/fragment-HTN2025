import "./globals.css";
import { SearchProvider } from "./contexts/SearchContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <SearchProvider>{children}</SearchProvider>
  );
}