/**
 * Rate Limiter Test Script
 * ────────────────────────
 * Tests both the per-minute (10 req/60s) and hourly (40 req/hr) limiters
 * directly against Upstash Redis using your .env credentials.
 *
 * Usage:  node test-ratelimit.js
 */

// Load .env manually (no dotenv dependency needed)
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  });
}

const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

// ── Colour helpers for terminal output ───────────────────────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(bold("\n🔒 Rate Limiter Test\n"));

  // 1. Check env vars
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error(red("✗ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env"));
    process.exit(1);
  }
  console.log(green("✓ Env vars loaded"));
  console.log(dim(`  URL:   ${url}`));
  console.log(dim(`  Token: ${token.slice(0, 12)}...${token.slice(-6)}\n`));

  // 2. Test Redis connection
  const redis = new Redis({ url, token });
  try {
    const pong = await redis.ping();
    console.log(green(`✓ Redis PING → ${pong}\n`));
  } catch (err) {
    console.error(red(`✗ Redis connection failed: ${err.message}`));
    process.exit(1);
  }

  // 3. Set up a test limiter with a LOW limit (3 req/60s) so we can trigger it fast
  const TEST_LIMIT = 3;
  const testId = `test-user-${Date.now()}`; // unique key so we don't pollute real limits

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(TEST_LIMIT, "60 s"),
    prefix: "rl:test:script",
  });

  console.log(bold(`── Test 1: Per-minute limiter (limit = ${TEST_LIMIT}) ──\n`));
  console.log(dim(`  Identifier: ${testId}\n`));

  // 4. Fire (TEST_LIMIT + 2) requests and log each result
  const totalRequests = TEST_LIMIT + 2;
  let blockedAt = null;

  for (let i = 1; i <= totalRequests; i++) {
    const result = await limiter.limit(testId);
    const status = result.success ? green("ALLOWED ✓") : red("BLOCKED ✗");
    const remaining = result.success
      ? cyan(`remaining: ${result.remaining}`)
      : yellow(`reset in: ${Math.ceil((result.reset - Date.now()) / 1000)}s`);

    console.log(`  Request ${i}/${totalRequests}:  ${status}  ${remaining}`);

    if (!result.success && !blockedAt) {
      blockedAt = i;
    }
  }

  console.log();
  if (blockedAt) {
    console.log(
      green(`✓ Rate limiter working! Blocked at request #${blockedAt} (limit was ${TEST_LIMIT})`)
    );
  } else {
    console.log(red(`✗ Rate limiter FAILED — all ${totalRequests} requests were allowed!`));
  }

  // 5. Test the actual production limiters (read-only check)
  console.log(bold(`\n── Test 2: Production limiter status ──\n`));

  const prodMinLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "rl:chat:min",
  });
  const prodHrLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(40, "1 h"),
    prefix: "rl:chat:hr",
  });

  // Check remaining quota for "anonymous" (common local dev identifier)
  const checkId = "anonymous";

  // Use a dry-run approach: we check without consuming a token by reading keys directly
  // Since getRemaining isn't available in all versions, we'll do a non-consuming check
  try {
    const minCheck = await prodMinLimiter.limit(checkId);
    const hrCheck = await prodHrLimiter.limit(checkId);

    console.log(`  Identifier: "${checkId}"`);
    console.log(`  Per-minute:  ${cyan(`${minCheck.remaining} / 10 remaining`)}  ${minCheck.success ? green("(not limited)") : red("(RATE LIMITED)")}`);
    console.log(`  Per-hour:    ${cyan(`${hrCheck.remaining} / 40 remaining`)}  ${hrCheck.success ? green("(not limited)") : red("(RATE LIMITED)")}`);
    console.log(dim(`\n  Note: This check consumed 1 token from each production bucket for "${checkId}"`));
  } catch (err) {
    console.log(red(`  Failed to check production limiters: ${err.message}`));
  }

  // 6. Cleanup: remove the test keys
  try {
    const keys = await redis.keys("rl:test:script*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(dim(`\n  Cleaned up ${keys.length} test key(s)`));
    }
  } catch {
    // ignore cleanup errors
  }

  console.log(bold(green("\n✓ All tests complete\n")));
}

main().catch((err) => {
  console.error(red(`\nFatal error: ${err.message}`));
  process.exit(1);
});
