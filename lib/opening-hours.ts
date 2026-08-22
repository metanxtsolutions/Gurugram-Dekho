/**
 * Opening-hours logic.
 *
 * Everything is computed in Asia/Kolkata regardless of where the server runs,
 * because "open now" means open in Gurugram, a UTC server would otherwise
 * tell a reader in Sector 29 that a café closed five and a half hours ago.
 */

export type Interval = { day: number; opensAt: number; closesAt: number };

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MINUTES_PER_DAY = 1440;

/** Local time in Gurugram as { day, minutes }, independent of server timezone. */
export function nowInGurugram(reference = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(reference);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = DAY_SHORT.findIndex((d) => d === get('weekday'));
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);

  return { day: day < 0 ? reference.getDay() : day, minutes: hour * 60 + minute };
}

export function formatMinutes(minutes: number) {
  const m = minutes % MINUTES_PER_DAY;
  const hour24 = Math.floor(m / 60);
  const min = m % 60;
  const suffix = hour24 >= 12 ? 'pm' : 'am';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return min === 0 ? `${hour12}${suffix}` : `${hour12}:${String(min).padStart(2, '0')}${suffix}`;
}

export type OpenState =
  | { status: 'always'; label: string }
  | { status: 'open'; label: string; closesAt: number; closingSoon: boolean }
  | { status: 'closed'; label: string; opensNext?: { day: number; minutes: number } }
  | { status: 'unknown'; label: string };

/**
 * An interval starting on day D can run past midnight into D+1, so a lookup
 * has to consider both today's intervals and yesterday's spillover.
 */
export function getOpenState(
  intervals: Interval[],
  alwaysOpen: boolean,
  reference = new Date()
): OpenState {
  if (alwaysOpen) return { status: 'always', label: 'Open 24 hours' };
  if (intervals.length === 0) return { status: 'unknown', label: 'Hours not listed' };

  const { day, minutes } = nowInGurugram(reference);
  const yesterday = (day + 6) % 7;

  for (const i of intervals) {
    // Today's intervals.
    if (i.day === day && minutes >= i.opensAt && minutes < i.closesAt) {
      return openResult(i.closesAt, minutes);
    }
    // Yesterday's interval spilling past midnight into today.
    if (i.day === yesterday && i.closesAt > MINUTES_PER_DAY) {
      const endToday = i.closesAt - MINUTES_PER_DAY;
      if (minutes < endToday) return openResult(endToday, minutes);
    }
  }

  const next = findNextOpening(intervals, day, minutes);
  return {
    status: 'closed',
    label: next
      ? next.day === day
        ? `Closed · opens ${formatMinutes(next.minutes)}`
        : `Closed · opens ${DAY_SHORT[next.day]} ${formatMinutes(next.minutes)}`
      : 'Closed',
    opensNext: next ?? undefined,
  };
}

function openResult(closesAt: number, nowMinutes: number): OpenState {
  const until = closesAt - nowMinutes;
  return {
    status: 'open',
    closesAt,
    closingSoon: until <= 60,
    label:
      until <= 60
        ? `Closing soon · ${formatMinutes(closesAt)}`
        : `Open until ${formatMinutes(closesAt)}`,
  };
}

function findNextOpening(intervals: Interval[], day: number, minutes: number) {
  for (let offset = 0; offset < 8; offset++) {
    const candidateDay = (day + offset) % 7;
    const sameDay = intervals
      .filter((i) => i.day === candidateDay)
      .filter((i) => offset > 0 || i.opensAt > minutes)
      .sort((a, b) => a.opensAt - b.opensAt);

    if (sameDay.length > 0) return { day: candidateDay, minutes: sameDay[0].opensAt };
  }
  return null;
}

/** Intervals grouped per weekday for a hours table, Monday first. */
export function weekSchedule(intervals: Interval[]) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((day) => ({
    day,
    name: DAY_NAMES[day],
    short: DAY_SHORT[day],
    intervals: intervals
      .filter((i) => i.day === day)
      .sort((a, b) => a.opensAt - b.opensAt)
      .map((i) => `${formatMinutes(i.opensAt)} – ${formatMinutes(i.closesAt)}`),
  }));
}

/** Parse "9:00 AM – 10:00 PM" into minutes, for migrating legacy strings. */
export function parseLegacyHours(text: string): { opensAt: number; closesAt: number } | null {
  const match = text.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i
  );
  if (!match) return null;

  const toMinutes = (h: string, m: string | undefined, ap: string | undefined) => {
    let hour = parseInt(h, 10);
    const minute = m ? parseInt(m, 10) : 0;
    const period = ap?.toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const opensAt = toMinutes(match[1], match[2], match[3]);
  let closesAt = toMinutes(match[4], match[5], match[6]);
  // A closing time at or before opening means it runs past midnight.
  if (closesAt <= opensAt) closesAt += MINUTES_PER_DAY;

  return { opensAt, closesAt };
}
