import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinegram - AI Video Greeting Cards",
  description: "Create personalized AI video greeting cards with custom voice cloning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
