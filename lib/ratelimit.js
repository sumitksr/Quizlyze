import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis client — reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv();

/**
 * Sliding-window rate limiters:
 *
 *  chatLimiter  — 10 requests / 60 s  (per-request cost control)
 *  hourlyLimiter — 40 requests / 1 hr  (hourly burn cap)
 *
 * Adjust the numbers here to tighten/loosen limits.
 */
export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "rl:chat:min",
});

export const hourlyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(40, "1 h"),
  analytics: true,
  prefix: "rl:chat:hr",
});

/**
 * Check both per-minute and hourly limits for the given identifier (IP or userId).
 * Returns { success, limit, remaining, reset, reason } where reason is
 * "per_minute" | "per_hour" | null.
 */
export async function checkRateLimit(identifier) {
  const [minute, hourly] = await Promise.all([
    chatLimiter.limit(identifier),
    hourlyLimiter.limit(identifier),
  ]);

  if (!minute.success) {
    return { ...minute, reason: "per_minute" };
  }
  if (!hourly.success) {
    return { ...hourly, reason: "per_hour" };
  }
  return { ...minute, reason: null };
}
