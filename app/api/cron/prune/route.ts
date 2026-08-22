import { NextRequest, NextResponse } from 'next/server';
import { pruneRateLimits } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/utils';

/**
 * Housekeeping, called on a schedule.
 *
 * Rate-limit rows are reused in place once their window closes, so nothing
 * breaks without this, it only stops the table accumulating a row per
 * one-off visitor.
 *
 * Authorised with CRON_SECRET. Vercel Cron sends it as a bearer token; any
 * other scheduler can do the same. Without the variable set the route refuses
 * everything rather than defaulting to open.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      errorResponse('Cron is not configured: set CRON_SECRET'),
      { status: 503 }
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json(errorResponse('Unauthorised'), { status: 401 });
  }

  const pruned = await pruneRateLimits();

  return NextResponse.json({ success: true, data: { prunedRateLimits: pruned } });
}
