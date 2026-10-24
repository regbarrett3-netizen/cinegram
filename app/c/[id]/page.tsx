import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { freeRepliesTo, getCard } from "../../../lib/db";
import { isLang } from "../../../lib/i18n";
import { RecipientView, type PublicCard } from "../../../components/RecipientView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const row = await getCard(params.id).catch(() => null);
  const title = row?.paid_at ? `${row.from_name} sent you a card 💌` : "Cinegram card";
  return {
    title,
    robots: { index: false, follow: false },
    description: "Open your card on Cinegram 💌",
    openGraph: row?.paid_at && row.image_url ? { title, description: "Open your card on Cinegram 💌", images: [row.image_url] } : { title },
    twitter: row?.paid_at && row.image_url ? { card: "summary_large_image", title, images: [row.image_url] } : { card: "summary", title },
  };
}

export default async function CardPage({ params }: { params: { id: string } }) {
  const row = await getCard(params.id).catch(() => null);
  if (!row || !row.paid_at) notFound();
  // Only what the page needs: never the recipient's email address.
  const replyFree = !!row.sender_email && (await freeRepliesTo(row.id).catch(() => 1)) === 0;
  const card: PublicCard = {
    id: row.id,
    replyFree,
    kind: row.kind,
    cardId: row.card_id,
    occasion: row.occasion,
    lang: isLang(row.lang) ? row.lang : "en",
    toName: row.to_name,
    fromName: row.from_name,
    photoUrl: row.photo_url,
    videoUrl: row.video_url,
  };
  return <RecipientView card={card} />;
}
