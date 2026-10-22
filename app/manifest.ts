import type { MetadataRoute } from "next";

// Lets people add CineGramCards.com to their phone's home screen with the logo as its icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CineGramCards.com",
    short_name: "CineGramCards",
    description: "All-occasion cards: original art, animated cards with music, or a video in your own voice.",
    start_url: "/",
    display: "standalone",
    background_color: "#140a1f",
    theme_color: "#140a1f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
