// Stores a photo the sender adds to their card (already shrunk in the browser).
import { NextRequest, NextResponse } from "next/server";
import { newId, uploadPublic } from "../../../lib/db";

export const runtime = "nodejs";
const MB = 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const photo = form.get("photo");
    if (!(photo instanceof Blob) || !/^image\/(jpeg|png|webp)$/.test(photo.type) || photo.size > 4 * MB || photo.size < 500) {
      return NextResponse.json({ error: "Please choose a JPEG or PNG photo under 4 MB." }, { status: 400 });
    }
    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const url = await uploadPublic("photos", `${newId()}.${ext}`, photo, photo.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
