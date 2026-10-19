import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Each card costs an ElevenLabs voice clone + TTS and a fal render, so keep this tight
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

type LimitResult = { success: boolean; reset: number };

const hasRedis = Boolean(
  (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
);

const redisLimiter = hasRedis
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(LIMIT, "1 h"),
      prefix: "cinegram:generate-card",
    })
  : null;

// Fallback for local dev: per-instance only, so it does not hold up across serverless instances
const memoryHits = new Map<string, number[]>();

function memoryLimit(key: string): LimitResult {
  const now = Date.now();
  const hits = (memoryHits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  const success = hits.length < LIMIT;
  if (success) hits.push(now);
  memoryHits.set(key, hits);
  return { success, reset: hits[0] + WINDOW_MS };
}

export async function limitCardGeneration(key: string): Promise<LimitResult> {
  if (!redisLimiter) return memoryLimit(key);
  const { success, reset } = await redisLimiter.limit(key);
  return { success, reset };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}
