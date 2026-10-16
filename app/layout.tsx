import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinegram",
  description: "AI Video Greeting Cards",
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
