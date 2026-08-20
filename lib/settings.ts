import 'server-only';
import { cache } from 'react';
import prisma from '@/lib/db';

/**
 * Site configuration, editable from the admin panel and read by the root
 * layout. Every key has a default, so the site renders correctly before an
 * admin has ever opened Settings.
 *
 * SMTP fields deliberately excluded: nothing in this codebase sends mail, and
 * storing credentials for a feature that does not exist is worse than the
 * field being absent.
 */

export const SETTING_DEFAULTS = {
  siteTitle: 'Gurugram Dekho',
  siteTagline: 'Millennium City guide',
  siteDescription:
    'An independent guide to Gurugram and Gurgaon — food, places, rentals and work, written by people who live here.',
  defaultMetaDescription:
    'Discover Gurugram/Gurgaon — restaurants, cafés, places, events and local information.',
  contactEmail: '',
  googleAnalyticsId: '',
  searchConsoleVerification: '',
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[];

/**
 * Deduplicated per request — the layout and a page in the same render share
 * one query rather than issuing two.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: SETTING_KEYS } },
      select: { key: true, value: true },
    });

    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    return SETTING_KEYS.reduce((acc, key) => {
      const value = stored[key];
      acc[key] = value !== undefined && value !== '' ? value : SETTING_DEFAULTS[key];
      return acc;
    }, {} as Settings);
  } catch (error) {
    // Settings must never take the site down — fall back to the defaults.
    console.error('getSettings failed, using defaults:', error);
    return { ...SETTING_DEFAULTS };
  }
});

/** Values exactly as stored, with '' for unset — for the admin form. */
export async function getRawSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: SETTING_KEYS } },
    select: { key: true, value: true },
  });
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return SETTING_KEYS.reduce((acc, key) => {
    acc[key] = stored[key] ?? '';
    return acc;
  }, {} as Settings);
}

export async function saveSettings(values: Partial<Settings>, userId: string) {
  const entries = Object.entries(values).filter(([key]) =>
    SETTING_KEYS.includes(key as SettingKey)
  );

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value ?? '', updatedById: userId },
        create: { key, value: value ?? '', updatedById: userId },
      })
    )
  );
}
