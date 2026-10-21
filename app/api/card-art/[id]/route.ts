// Serves a card's artwork (no text) as an SVG image, for thumbnails.
import { ART, cardArtSvg } from "../../../../lib/cardArt";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!Object.prototype.hasOwnProperty.call(ART, params.id)) return new Response("Not found", { status: 404 });
  return new Response(cardArtSvg(params.id).svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
