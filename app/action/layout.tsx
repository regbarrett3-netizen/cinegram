import type { Metadata } from "next";
import { cardSerif } from "../../lib/cardFont";

export const metadata: Metadata = {
  title: "Action Cards – Cinegram",
  description: "Animated video cards: balloon releases, a dozen roses, doves, fireworks and more. $2.99.",
};

export default function ActionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <span className={cardSerif.className} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        Aa
      </span>
      {children}
    </div>
  );
}
