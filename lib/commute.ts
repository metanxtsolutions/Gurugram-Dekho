/**
 * Commute comparison: metro vs cab vs auto between the hubs a newcomer
 * actually travels between.
 *
 * Everything here is an estimate built from a small, dated table. Distances
 * come from the hub coordinates with a road factor; metro time comes from
 * station counts on the two lines; cab and auto fares from the going rates in
 * August 2026. The page says so. The point is the shape of the answer, which
 * option wins when, not a fare to the rupee.
 */

export type Line = 'Yellow Line' | 'Rapid Metro';

export type Hub = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  /** Nearest station, if there is one worth using. */
  metro?: { station: string; line: Line; walkMins: number };
};

export const HUBS: Hub[] = [
  { slug: 'cyber-city', name: 'Cyber City', lat: 28.4952, lng: 77.0888, metro: { station: 'Cyber City', line: 'Rapid Metro', walkMins: 6 } },
  { slug: 'udyog-vihar', name: 'Udyog Vihar', lat: 28.5021, lng: 77.0855, metro: { station: 'Cyber City', line: 'Rapid Metro', walkMins: 15 } },
  { slug: 'dlf-phase-3', name: 'DLF Phase 3', lat: 28.4949, lng: 77.0921, metro: { station: 'Moulsari Avenue', line: 'Rapid Metro', walkMins: 6 } },
  { slug: 'mg-road', name: 'MG Road', lat: 28.4801, lng: 77.0805, metro: { station: 'MG Road', line: 'Yellow Line', walkMins: 3 } },
  { slug: 'sector-29', name: 'Sector 29', lat: 28.4595, lng: 77.0592, metro: { station: 'Millennium City Centre', line: 'Yellow Line', walkMins: 15 } },
  { slug: 'golf-course-road', name: 'Golf Course Road', lat: 28.4589, lng: 77.0583, metro: { station: 'Sector 42-43', line: 'Rapid Metro', walkMins: 6 } },
  { slug: 'sector-56', name: 'Sector 56', lat: 28.4211, lng: 77.1015, metro: { station: 'Sector 55-56', line: 'Rapid Metro', walkMins: 6 } },
  { slug: 'sohna-road', name: 'Sohna Road', lat: 28.4089, lng: 77.0392 },
  { slug: 'old-gurgaon', name: 'Old Gurgaon', lat: 28.4601, lng: 77.0299 },
];

export const COMMUTE_VERIFIED = 'August 2026';

/* ── Metro geometry ─────────────────────────────────────────────────── */

/** Yellow Line stations on the Gurugram stretch, in order from Delhi. */
const YELLOW = ['Guru Dronacharya', 'Sikanderpur', 'MG Road', 'IFFCO Chowk', 'Millennium City Centre'];

/**
 * Rapid Metro, measured in stops from Sikanderpur, the interchange.
 * The loop can be ridden either way, so each loop station carries the shorter
 * count; the southern branch is a straight line.
 */
const RAPID_FROM_SIKANDERPUR: Record<string, number> = {
  Sikanderpur: 0,
  'Phase 2': 1,
  'Belvedere Towers': 2,
  'Cyber City': 3,
  'Moulsari Avenue': 3,
  'Phase 3': 2,
  'Phase 1': 1,
  'Sector 42-43': 1,
  'Sector 53-54': 2,
  'Sector 54 Chowk': 3,
  'Sector 55-56': 4,
};
const RAPID_LOOP = new Set(['Phase 2', 'Belvedere Towers', 'Cyber City', 'Moulsari Avenue', 'Phase 3', 'Phase 1']);

const MIN_PER_STOP = { 'Yellow Line': 2.4, 'Rapid Metro': 2.2 } as const;
const INTERCHANGE_MINS = 8;

/** Fare bands, Delhi Metro, single journey. Rapid Metro is folded into the same bands. */
function metroFare(stops: number, interchange: boolean): [number, number] {
  const base = stops <= 2 ? 10 : stops <= 5 ? 20 : stops <= 9 ? 30 : 40;
  // An interchange onto the Rapid Metro adds its own segment.
  return interchange ? [base + 10, base + 25] : [base, base + 10];
}

function metroStops(a: Hub['metro'], b: Hub['metro']): { stops: number; interchange: boolean } | null {
  if (!a || !b) return null;
  if (a.line === 'Yellow Line' && b.line === 'Yellow Line') {
    return { stops: Math.abs(YELLOW.indexOf(a.station) - YELLOW.indexOf(b.station)), interchange: false };
  }
  if (a.line === 'Rapid Metro' && b.line === 'Rapid Metro') {
    const da = RAPID_FROM_SIKANDERPUR[a.station];
    const db = RAPID_FROM_SIKANDERPUR[b.station];
    // Both on the loop: ride it directly. Otherwise go via Sikanderpur.
    const stops = RAPID_LOOP.has(a.station) && RAPID_LOOP.has(b.station) ? Math.max(1, Math.abs(da - db)) : da + db;
    return { stops, interchange: false };
  }
  // One on each line: change at Sikanderpur.
  const y = a.line === 'Yellow Line' ? a : b;
  const r = a.line === 'Rapid Metro' ? a : b;
  const yellowStops = Math.abs(YELLOW.indexOf(y.station) - YELLOW.indexOf('Sikanderpur'));
  const rapidStops = RAPID_FROM_SIKANDERPUR[r.station];
  return { stops: yellowStops + rapidStops, interchange: true };
}

/* ── Road ───────────────────────────────────────────────────────────── */

function haversineKm(a: Hub, b: Hub) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Straight line to road distance. Gurugram's grid and flyovers run about 1.35. */
const ROAD_FACTOR = 1.35;

export type When = 'offpeak' | 'peak' | 'late';

export const WHEN_LABEL: Record<When, string> = {
  offpeak: 'Off-peak',
  peak: 'Peak (8 to 10am, 6 to 8pm)',
  late: 'Late night (after 11pm)',
};

export type Option = {
  mode: 'metro' | 'cab' | 'auto';
  label: string;
  available: boolean;
  timeMin: number;
  timeMax: number;
  costMin: number;
  costMax: number;
  note: string;
};

export type Estimate = {
  from: Hub;
  to: Hub;
  roadKm: number;
  options: Option[];
  verdict: string;
};

export function estimate(fromSlug: string, toSlug: string, when: When): Estimate | null {
  const from = HUBS.find((h) => h.slug === fromSlug);
  const to = HUBS.find((h) => h.slug === toSlug);
  if (!from || !to || from.slug === to.slug) return null;

  const roadKm = Math.max(1.5, haversineKm(from, to) * ROAD_FACTOR);
  const options: Option[] = [];

  // ── Metro ──
  const stops = metroStops(from.metro, to.metro);
  if (!stops || !from.metro || !to.metro) {
    const missing = !from.metro ? from.name : to.name;
    options.push({
      mode: 'metro',
      label: 'Metro',
      available: false,
      timeMin: 0, timeMax: 0, costMin: 0, costMax: 0,
      note: `${missing} has no station close enough to count. The nearest is Millennium City Centre, which is a cab or auto ride on its own.`,
    });
  } else if (when === 'late') {
    options.push({
      mode: 'metro',
      label: 'Metro',
      available: false,
      timeMin: 0, timeMax: 0, costMin: 0, costMax: 0,
      note: 'Last trains leave around 11pm on the Yellow Line and a little earlier on the Rapid Metro. After that it is cab or auto.',
    });
  } else {
    const lineMins =
      stops.stops * (from.metro.line === 'Yellow Line' && to.metro.line === 'Yellow Line' ? MIN_PER_STOP['Yellow Line'] : MIN_PER_STOP['Rapid Metro']) +
      (stops.interchange ? INTERCHANGE_MINS : 0);
    const wait = when === 'peak' ? 4 : 7;
    const walk = from.metro.walkMins + to.metro.walkMins;
    const t = lineMins + wait + walk;
    const [fMin, fMax] = metroFare(stops.stops, stops.interchange);
    options.push({
      mode: 'metro',
      label: 'Metro',
      available: true,
      timeMin: Math.round(t * 0.9),
      timeMax: Math.round(t * 1.15),
      costMin: fMin,
      costMax: fMax,
      note: stops.interchange
        ? `${from.metro.station} to ${to.metro.station}, changing at Sikanderpur. About ${walk} minutes of that is walking at the two ends.`
        : `${from.metro.station} to ${to.metro.station}, ${stops.stops} ${stops.stops === 1 ? 'stop' : 'stops'}, no change. About ${walk} minutes of that is walking at the two ends.`,
    });
  }

  // ── Cab ──
  const cabSpeed = when === 'peak' ? 14 : when === 'late' ? 32 : 24;
  const cabDrive = (roadKm / cabSpeed) * 60;
  const cabBase = 60 + roadKm * 14;
  const surge = when === 'peak' ? [1.2, 1.7] : when === 'late' ? [1.1, 1.5] : [1, 1.2];
  options.push({
    mode: 'cab',
    label: 'Cab (Ola, Uber)',
    available: true,
    timeMin: Math.round(cabDrive + 4),
    timeMax: Math.round(cabDrive * 1.25 + 9),
    costMin: Math.round((cabBase * surge[0]) / 10) * 10,
    costMax: Math.round((cabBase * surge[1]) / 10) * 10,
    note:
      when === 'peak'
        ? 'Surge is normal at these hours and the pickup wait is the unpredictable part. Book before you leave the building.'
        : when === 'late'
          ? 'Roads are empty but surge and cancellations rise after 11pm. Share the trip with someone.'
          : 'The dependable middle option. The fare range covers a normal day without surge.',
  });

  // ── Auto ──
  const autoSpeed = when === 'peak' ? 12 : 20;
  const autoDrive = (roadKm / autoSpeed) * 60;
  const autoFare = Math.max(40, 30 + roadKm * 13);
  const tooFar = roadKm > 12;
  options.push({
    mode: 'auto',
    label: 'Auto',
    available: !tooFar,
    timeMin: Math.round(autoDrive + 3),
    timeMax: Math.round(autoDrive * 1.3 + 8),
    costMin: Math.round((autoFare * (when === 'late' ? 1.3 : 1)) / 10) * 10,
    costMax: Math.round((autoFare * (when === 'late' ? 1.8 : 1.35)) / 10) * 10,
    note: tooFar
      ? `At about ${Math.round(roadKm)} km this is further than most autos will go at a sane price. Cab or metro.`
      : when === 'late'
        ? 'Fewer autos on the road and the price is whatever the driver says. Agree it before you get in.'
        : 'Meters are rarely used. Agree the fare first; the range here is what locals pay.',
  });

  // ── Verdict ──
  const live = options.filter((o) => o.available);
  const cheapest = [...live].sort((a, b) => a.costMin - b.costMin)[0];
  const fastest = [...live].sort((a, b) => a.timeMax - b.timeMax)[0];
  let verdict: string;
  if (cheapest.mode === fastest.mode) {
    verdict = `${cheapest.label} wins on both time and money here.`;
  } else {
    verdict = `${fastest.label} is quicker, ${cheapest.label.toLowerCase()} is cheaper.`;
  }
  if (when === 'peak' && live.some((o) => o.mode === 'metro')) {
    verdict += ' At peak the metro is the only option whose time you can actually plan around.';
  }
  if (when === 'late') {
    verdict += ' This late, the question is safety more than cost: a booked cab with the trip shared beats an auto flagged on the road.';
  }

  return { from, to, roadKm, options, verdict };
}
