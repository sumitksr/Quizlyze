import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Upstash Redis client ─────────────────────────────────────────────────────
// Reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN from env
let redis;
try {
  redis = Redis.fromEnv();
} catch (err) {
  console.error("[RateLimit] Failed to initialize Upstash Redis:", err.message);
  redis = null;
}

/**
 * Sliding-window rate limiters:
 *
 *  chatLimiter   — 10 requests / 60 s  (per-request cost control)
 *  hourlyLimiter — 40 requests / 1 hr  (hourly burn cap)
 *
 * Adjust the numbers here to tighten/loosen limits.
 */
const chatLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "rl:chat:min",
    })
  : null;

const hourlyLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, "1 h"),
      analytics: true,
      prefix: "rl:chat:hr",
    })
  : null;

export { chatLimiter, hourlyLimiter };

/**
 * Check both per-minute and hourly limits for the given identifier (IP or userId).
 * Returns { success, limit, remaining, reset, reason } where reason is
 * "per_minute" | "per_hour" | null.
 *
 * Key fix: limiters are checked SEQUENTIALLY (not in parallel) so the hourly
 * bucket is not consumed when the per-minute limit already rejected the request.
 */
export async function checkRateLimit(identifier) {
  // If Redis failed to initialize, log a warning and allow the request through
  // (fail-open) so the app doesn't break entirely — but make it very visible.
  if (!chatLimiter || !hourlyLimiter) {
    console.warn(
      "[RateLimit] Upstash Redis is not configured — rate limiting is DISABLED. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env."
    );
    return { success: true, limit: 0, remaining: 0, reset: 0, reason: null };
  }

  try {
    // 1. Check per-minute limit FIRST
    const minute = await chatLimiter.limit(identifier);
    console.log(
      `[RateLimit] id=${identifier} | per-min: remaining=${minute.remaining}, success=${minute.success}`
    );

    if (!minute.success) {
      return { ...minute, reason: "per_minute" };
    }

    // 2. Only check hourly limit if per-minute passed
    const hourly = await hourlyLimiter.limit(identifier);
    console.log(
      `[RateLimit] id=${identifier} | hourly: remaining=${hourly.remaining}, success=${hourly.success}`
    );

    if (!hourly.success) {
      return { ...hourly, reason: "per_hour" };
    }

    // Both passed
    return { ...minute, reason: null };
  } catch (err) {
    // If Upstash is down or credentials are wrong, log the error and fail-open
    console.error("[RateLimit] Upstash Redis error:", err.message);
    return { success: true, limit: 0, remaining: 0, reset: 0, reason: null };
  }
}
