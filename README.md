# Cinegram

AI video greeting cards: your selfie says your message in your own voice, in English, Spanish, French, Portuguese, Mandarin or Cantonese.

## How it works

1. The person picks a language and occasion, writes a short message (a default greeting is filled in), and optionally describes a scene.
2. They upload a selfie and read a short script aloud (or upload a voice clip), then confirm they have permission to use that face and voice.
3. `POST /api/create` uploads the photo to fal, makes a temporary ElevenLabs voice clone, speaks the message with it, **deletes the clone**, and queues a talking-face video on fal (Kling AI Avatar v2 Standard).
4. The page polls `GET /api/status` until the video is ready, then shows a watermarked preview.
5. `POST /api/checkout` opens Stripe Checkout ($2.99). After payment, `GET /api/unlock` confirms it and `GET /api/download` streams the MP4.

No database is needed: the Stripe session carries the video's job id.

## Environment variables

| Name | Where to get it |
| --- | --- |
| `FAL_KEY` | fal.ai → Dashboard → Keys |
| `ELEVENLABS_API_KEY` | elevenlabs.io → Developers → API Keys (needs a plan that allows Instant Voice Cloning) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys (use `sk_test_…` while testing) |
| `NEXT_PUBLIC_APP_URL` | Optional. Your site's address, e.g. `https://cinegram.vercel.app`. Defaults to the address the request came in on. |

## Notes

- Each generated video costs fal credits even if the person never buys. The preview watermark is an on-screen overlay, so a determined person could still find the preview file.
- Voice samples are converted to WAV in the browser (max 45 s), and photos are shrunk to 1280 px, to stay under Vercel's 4.5 MB request limit.
