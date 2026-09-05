/**
 * Editorial notes for the sector decoder.
 *
 * What a newcomer means by "Cyber City" is a judgement, not a database fact:
 * it spans two sector numbers, overlaps DLF Phase 3, and has a metro station
 * inside it. That kind of knowledge lives here, keyed by the Area slug, and is
 * merged with the Area record (guides, places, description) at request time.
 *
 * The eventual home for `metro` is a column on Area. Keeping it here for now
 * avoids a production migration for a field only one page reads, and keeps
 * the "verified" date next to the claim it dates.
 *
 * Sector numbers may overlap between entries on purpose. A search for 24
 * should show both Cyber City and DLF Phase 3, because both answers are true.
 */

export type SectorNote = {
  /** Area slug in the database. */
  slug: string;
  /** Display name. The Area row has one too; this covers an empty database. */
  name: string;
  /** Sector numbers people use for this area. */
  sectors: number[];
  /** Other names people type. Lowercase. */
  aliases: string[];
  /** Nearest useful metro station and how to reach it. */
  metro: { station: string; line: 'Yellow Line' | 'Rapid Metro'; reach: string };
  /** The one line a local would give you. */
  character: string;
  /** When the metro and character lines were last checked. */
  verified: string;
};

export const SECTOR_NOTES: SectorNote[] = [
  {
    slug: 'sector-29',
    name: 'Sector 29',
    sectors: [29],
    aliases: ['leisure valley', 'huda', 'huda city centre'],
    metro: {
      station: 'Millennium City Centre',
      line: 'Yellow Line',
      reach: 'about 15 minutes on foot to the food strip, or a shared auto for ₹20',
    },
    character: 'Where everyone goes to eat. Loud, and worth it once.',
    verified: '2026-08',
  },
  {
    slug: 'cyber-city',
    name: 'Cyber City',
    sectors: [24, 25],
    aliases: ['cyber hub', 'dlf cyber city', 'cybercity'],
    metro: {
      station: 'Cyber City',
      line: 'Rapid Metro',
      reach: 'the station is inside the district, most towers are under ten minutes on foot',
    },
    character: 'Where you probably work. Better food than it gets credit for.',
    verified: '2026-08',
  },
  {
    slug: 'golf-course-road',
    name: 'Golf Course Road',
    sectors: [42, 43, 53, 54],
    aliases: ['gcr', 'golf course', 'dlf phase 5', 'phase 5'],
    metro: {
      station: 'Sector 42-43 and Sector 53-54',
      line: 'Rapid Metro',
      reach: 'the line runs down the road itself, every stop is walkable to what it is named after',
    },
    character: 'Quieter money. Hotels, rooftops, and the good spas.',
    verified: '2026-08',
  },
  {
    slug: 'mg-road',
    name: 'MG Road',
    sectors: [28],
    aliases: ['mehrauli gurgaon road', 'sikanderpur', 'dlf phase 1', 'phase 1'],
    metro: {
      station: 'MG Road',
      line: 'Yellow Line',
      reach: 'the malls open straight onto the station, Sikanderpur is one stop further for the Rapid Metro change',
    },
    character: 'The original mall strip, and still the easiest place to reach by train.',
    verified: '2026-08',
  },
  {
    slug: 'sohna-road',
    name: 'Sohna Road',
    sectors: [47, 48, 49, 50],
    aliases: ['sohna', 'south city', 'south city 2', 'subhash chowk'],
    metro: {
      station: 'Millennium City Centre',
      line: 'Yellow Line',
      reach: 'no metro on the road itself; 20 to 35 minutes by cab depending on the hour, and the hour matters',
    },
    character: 'Cafés and quiet corners, and a commute you should test before you sign.',
    verified: '2026-08',
  },
  {
    slug: 'old-gurgaon',
    name: 'Old Gurgaon',
    sectors: [4, 5, 6, 7, 12, 14],
    aliases: ['sadar', 'sadar bazaar', 'jacobpura', 'old gurugram', 'civil lines', 'sector 14'],
    metro: {
      station: 'Millennium City Centre',
      line: 'Yellow Line',
      reach: 'about 15 minutes by auto to Sadar Bazaar, longer on market days',
    },
    character: 'Sadar Bazaar and the parts that were here first.',
    verified: '2026-08',
  },
  {
    slug: 'dlf-phase-3',
    name: 'DLF Phase 3',
    sectors: [24],
    aliases: ['phase 3', 'dlf 3', 'moulsari', 'u block', 'v block'],
    metro: {
      station: 'Moulsari Avenue',
      line: 'Rapid Metro',
      reach: 'inside the colony; Guru Dronacharya on the Yellow Line is a short auto ride for Delhi trips',
    },
    character: 'Long-settled colony next to Cyber City. Families, and a lot of PGs.',
    verified: '2026-08',
  },
  {
    slug: 'sector-56',
    name: 'Sector 56',
    sectors: [55, 56],
    aliases: ['sector 55', 'sushant lok 2', 'sushant lok'],
    metro: {
      station: 'Sector 55-56',
      line: 'Rapid Metro',
      reach: 'the last stop on the line, so you always get a seat in the morning',
    },
    character: 'Where people live when they want the metro and some quiet.',
    verified: '2026-08',
  },
  {
    slug: 'udyog-vihar',
    name: 'Udyog Vihar',
    sectors: [18, 19, 20],
    aliases: ['udyog', 'udyog vihar phase 4', 'uv'],
    metro: {
      station: 'Cyber City',
      line: 'Rapid Metro',
      reach: '10 to 20 minutes on foot depending on the phase, or Guru Dronacharya on the Yellow Line from the northern end',
    },
    character: 'Warehouses, startups, and day passes without a membership.',
    verified: '2026-08',
  },
];

/** Gurugram's sectors run from 1 to 115. */
export const SECTOR_MAX = 115;

export function noteForSlug(slug: string): SectorNote | undefined {
  return SECTOR_NOTES.find((n) => n.slug === slug);
}

/**
 * Turn whatever someone typed into either a sector number or a cleaned name.
 * "Sec 29", "sector-29", "S29" and "29" all become 29.
 */
export function parseSectorQuery(raw: string): { number: number | null; text: string } {
  const text = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  const m = text.match(/^(?:sector|sec|s)?\s*-?\s*(\d{1,3})\s*[a-z]?$/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= SECTOR_MAX) return { number: n, text };
  }
  return { number: null, text };
}

/**
 * Which notes match a query. A number matches on sectors; text matches on the
 * slug, aliases, or the area name passed in by the caller.
 */
export function matchNotes(
  query: string,
  names: Record<string, string>
): { number: number | null; matches: SectorNote[] } {
  const { number, text } = parseSectorQuery(query);
  if (text.length === 0) return { number: null, matches: [] };

  if (number !== null) {
    return { number, matches: SECTOR_NOTES.filter((n) => n.sectors.includes(number)) };
  }

  const matches = SECTOR_NOTES.filter((n) => {
    const name = (names[n.slug] ?? n.name).toLowerCase();
    return (
      name.includes(text) ||
      n.slug.replace(/-/g, ' ').includes(text) ||
      n.aliases.some((a) => a.includes(text) || text.includes(a))
    );
  });
  return { number: null, matches };
}
