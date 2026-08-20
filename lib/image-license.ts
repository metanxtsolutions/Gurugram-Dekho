/**
 * Licence and provenance vocabulary for images.
 *
 * The point of this file is that "where did this photo come from" is answerable
 * for every image on the site, and that the answer drives what the page must
 * legally render.
 */

export const SOURCES = {
  business: {
    label: 'Supplied by the business',
    hint: 'The venue sent it to us. Record who and when in the permission note.',
    needsPermissionNote: true,
  },
  community: {
    label: 'Reader submission',
    hint: 'Submitted through the site with an explicit licence grant.',
    needsPermissionNote: true,
  },
  openly_licensed: {
    label: 'Openly licensed (Commons etc.)',
    hint: 'Check the licence on the file page — it varies per photo.',
    needsPermissionNote: false,
  },
  official: {
    label: 'Official / government',
    hint: 'Haryana Tourism, GMDA, MCG. Confirm the reuse terms.',
    needsPermissionNote: false,
  },
  own: {
    label: 'Shot by us',
    hint: 'Our own photograph. No third-party rights involved.',
    needsPermissionNote: false,
  },
  stock: {
    label: 'Generic stock',
    hint: 'Illustrative only — must never stand in for a specific venue.',
    needsPermissionNote: false,
  },
} as const;

export type ImageSource = keyof typeof SOURCES;

export const LICENSES = {
  permission: { label: 'Direct permission', requiresCredit: false, url: null },
  cc0: { label: 'CC0 / Public domain', requiresCredit: false, url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  cc_by: { label: 'CC BY', requiresCredit: true, url: 'https://creativecommons.org/licenses/by/4.0/' },
  cc_by_sa: { label: 'CC BY-SA', requiresCredit: true, url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  godl: { label: 'GODL India', requiresCredit: true, url: 'https://data.gov.in/government-open-data-license-india' },
  unsplash: { label: 'Unsplash License', requiresCredit: false, url: 'https://unsplash.com/license' },
  proprietary: { label: 'Proprietary / all rights reserved', requiresCredit: true, url: null },
  unknown: { label: 'Unknown', requiresCredit: true, url: null },
} as const;

export type ImageLicense = keyof typeof LICENSES;

/** "exact" makes a factual claim; "illustrative" does not. */
export const DEPICTS = {
  exact: {
    label: 'Shows this exact place',
    hint: 'Required for a place or area image.',
  },
  illustrative: {
    label: 'Illustrative only',
    hint: 'Representative of the subject, not a photograph of it. Article headers only.',
  },
} as const;

export type Depicts = keyof typeof DEPICTS;

export const IMAGE_STATUSES = ['draft', 'approved', 'rejected'] as const;
export type ImageStatus = (typeof IMAGE_STATUSES)[number];

export const SOURCE_KEYS = Object.keys(SOURCES) as ImageSource[];
export const LICENSE_KEYS = Object.keys(LICENSES) as ImageLicense[];

export function licenseRequiresCredit(license: string) {
  return LICENSES[license as ImageLicense]?.requiresCredit ?? true;
}

export function licenseLabel(license: string) {
  return LICENSES[license as ImageLicense]?.label ?? license;
}

export function sourceLabel(source: string) {
  return SOURCES[source as ImageSource]?.label ?? source;
}

export type ProvenanceInput = {
  source: string;
  license: string;
  credit?: string | null;
  sourceUrl?: string | null;
  permissionNote?: string | null;
  depicts: string;
};

/**
 * The rules an image must satisfy before it can be approved for use.
 * Returned per-field so the admin form can highlight the offending input.
 */
export function checkProvenance(input: ProvenanceInput): Record<string, string[]> {
  const problems: Record<string, string[]> = {};

  if (!SOURCES[input.source as ImageSource]) {
    problems.source = ['Choose where this image came from'];
  }
  if (!LICENSES[input.license as ImageLicense]) {
    problems.license = ['Choose a licence'];
  }

  if (input.license === 'unknown') {
    problems.license = ['An image with an unknown licence cannot be approved'];
  }
  if (input.license === 'proprietary' && !input.permissionNote) {
    problems.permissionNote = ['Record the permission that allows this use'];
  }

  if (licenseRequiresCredit(input.license) && !input.credit?.trim()) {
    problems.credit = [`${licenseLabel(input.license)} requires a visible credit`];
  }

  const needsNote = SOURCES[input.source as ImageSource]?.needsPermissionNote;
  if (needsNote && !input.permissionNote?.trim()) {
    problems.permissionNote = [
      'Record who gave permission, when, and over which channel',
    ];
  }

  if (input.source === 'openly_licensed' && !input.sourceUrl?.trim()) {
    problems.sourceUrl = ['Link the file page so the licence can be re-checked'];
  }

  // The honesty rule: generic stock can never claim to be a specific place.
  if (input.source === 'stock' && input.depicts === 'exact') {
    problems.depicts = [
      'Stock photography cannot be marked as showing an exact place',
    ];
  }

  return problems;
}

/** Attribution string rendered on the page, or null when none is required. */
export function creditLine(image: {
  credit?: string | null;
  license: string;
  sourceUrl?: string | null;
}): string | null {
  if (!image.credit?.trim()) return null;
  const licence = licenseLabel(image.license);
  return licence === 'Direct permission'
    ? image.credit
    : `${image.credit} · ${licence}`;
}
