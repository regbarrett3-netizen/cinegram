import { notFound } from "next/navigation";
import { CARD_OCCASIONS, isArtOccasion } from "../../../lib/cardsCatalog";
import { OccasionView } from "../../../components/cards/OccasionView";

export function generateStaticParams() {
  return CARD_OCCASIONS.map((occasion) => ({ occasion }));
}

export default function OccasionPage({ params }: { params: { occasion: string } }) {
  if (!isArtOccasion(params.occasion)) notFound();
  return <OccasionView occasion={params.occasion} />;
}
