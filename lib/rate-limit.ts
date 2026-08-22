import 'server-only';
import prisma from '@/lib/db';

/**
 * Rate limiting for the public endpoints, backed by the database.
 *
 * The previous implementation kept counters in a module-level Map. That works
 * in one long-lived process and nowhere else: serverless instances each get
 * their own heap, so N instances meant N times the intended allowance, and a
 * redeploy reset every counter. The counter now lives in Postgres, which every
 * instance already shares.
 *
 * The window is fixed rather than sliding. A caller can therefore burst up to
 * 2x the limit across a window boundary, five at 12:59 and five at 13:01.
 * That is the standard trade for a single-statement check, and it is well
 * within tolerance for an abuse control on photo uploads. A sliding window
 * would need a row per hit and a periodic prune.
 */

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

type Options = { limit: number; windowMs: number };

export async function rateLimit(
  key: string,
  { limit, windowMs }: Options
): Promise<RateLimitResult> {
  const resetAt = new Date(Date.now() + windowMs);

  try {
    /*
     * One statement, so concurrent requests cannot both read a stale count.
     * When the stored window has already expired the row is reused and the
     * count restarts, which avoids a separate cleanup pass on the hot path.
     */
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count"   = CASE WHEN "RateLimit"."resetAt" <= now() THEN 1
                         ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= now() THEN ${resetAt}
                         ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"
    `;

    const row = rows[0];
    if (!row) return allow(limit);

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(row.resetAt).getTime() - Date.now()) / 1000)
    );

    return {
      allowed: row.count <= limit,
      limit,
      remaining: Math.max(0, limit - row.count),
      retryAfterSeconds,
    };
  } catch (error) {
    /*
     * Fail open. Every endpoint behind this limiter writes to the same
     * database moments later, so a genuine outage stops the request anyway -
     * refusing here would only turn a clear error into a misleading 429.
     */
    console.error('rateLimit check failed, allowing request:', error);
    return allow(limit);
  }
}

function allow(limit: number): RateLimitResult {
  return { allowed: true, limit, remaining: limit - 1, retryAfterSeconds: 0 };
}

/** Best-effort client identity behind a proxy. */
export function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${scope}:${ip}`;
}

/**
 * Drops rows whose window has closed. Nothing depends on this running, an
 * expired row is reused in place, it only stops the table growing with
 * one-off visitors. Safe to call from a cron or occasionally inline.
 */
export async function pruneRateLimits() {
  try {
    const { count } = await prisma.rateLimit.deleteMany({
      where: { resetAt: { lt: new Date() } },
    });
    return count;
  } catch (error) {
    console.error('pruneRateLimits failed:', error);
    return 0;
  }
}
