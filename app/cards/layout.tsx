import type { Metadata } from "next";
import { cardSerif } from "../../lib/cardFont";

export const metadata: Metadata = {
  title: "Quick Cards – Cinegram",
  description: "Beautiful ready-made art cards for every occasion, in six languages. $1.99, no AI.",
};

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  // The serif class loads the greeting font; the pages themselves stay in the app's sans-serif.
  return (
    <div>
      <span className={cardSerif.className} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        Aa
      </span>
      {children}
    </div>
  );
}
