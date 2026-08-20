import { revalidatePath } from 'next/cache';

/**
 * Cache invalidation for editor mutations.
 *
 * The homepage is statically rendered with `revalidate = 300` and the sitemap
 * is fully static, so both need an explicit purge whenever published content
 * changes — otherwise an edit can take up to five minutes to appear.
 *
 * Detail pages are rendered on demand, but they are still purged so their Data
 * Cache entry does not serve a stale payload.
 */

/** Paths that reflect the content set as a whole. */
const GLOBAL_PATHS = ['/', '/sitemap.xml', '/feed.xml'];

function purge(paths: (string | null | undefined)[]) {
  const unique = [...new Set([...GLOBAL_PATHS, ...paths.filter(Boolean) as string[]])];
  for (const path of unique) {
    try {
      revalidatePath(path);
    } catch (error) {
      // Never let a cache purge fail the write that already succeeded.
      console.error(`revalidatePath("${path}") failed:`, error);
    }
  }
}

export function revalidateArticle(
  slug?: string,
  categorySlugs: string[] = [],
  areaSlugs: string[] = []
) {
  purge([
    slug ? `/article/${slug}` : null,
    ...categorySlugs.map((c) => `/category/${c}`),
    // An article's coverage feeds the "Guides about X" block on area pages.
    ...areaSlugs.map((a) => `/area/${a}`),
  ]);
}

export function revalidatePlace(slug?: string, areaSlug?: string) {
  purge([
    slug ? `/place/${slug}` : null,
    areaSlug ? `/area/${areaSlug}` : null,
  ]);
}

export function revalidateArea(slug?: string) {
  purge([slug ? `/area/${slug}` : null]);
}

export function revalidateCategory(slug?: string) {
  purge([slug ? `/category/${slug}` : null]);
}
