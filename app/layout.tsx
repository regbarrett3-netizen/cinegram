import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cardSerif } from "../lib/cardFont";

export const metadata: Metadata = {
  title: "CineGramCards.com – All-occasion cards, sent in 1-2-3",
  metadataBase: new URL("https://cinegramcards.com"),
  description: "Pick the occasion, say who it's for, choose a card. Original art cards, animated cards with music and AI video cards, emailed for you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0814",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" style={{ "--font-serif": cardSerif.style.fontFamily } as React.CSSProperties}>{children}</body>
    </html>
  );
}
