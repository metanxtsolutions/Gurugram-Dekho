import { MetadataRoute } from 'next';
import prisma from '@/lib/db';

const baseUrl = 'https://gurugramdekho.com';

/*
 * Regenerate hourly. Without this the sitemap is generated once at build and
 * never again, so anything published between deploys stays invisible to
 * crawlers — and a build that ran against an empty database would freeze a
 * five-URL sitemap in place until someone happened to redeploy.
 */
export const revalidate = 3600;

type Row = { slug: string; updatedAt: Date };

const STATIC_PAGES = [
  { url: baseUrl, changeFrequency: 'daily', priority: 1.0 },
  { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${baseUrl}/privacy-policy`, changeFrequency: 'yearly', priority: 0.5 },
  { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.5 },
] as const satisfies readonly { url: string; changeFrequency: 'daily' | 'monthly' | 'yearly'; priority: number }[];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Row[] = [];
  let categories: Row[] = [];
  let areas: Row[] = [];
  let places: Row[] = [];

  /*
   * This route is statically generated, so an unreachable database at build
   * time would fail the entire deploy. Degrade to the static routes instead:
   * a sitemap missing its dynamic entries recovers on the next revalidation,
   * a failed build does not.
   */
  try {
    [articles, categories, areas, places] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'published', isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.area.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.place.findMany({
        where: { status: 'published', isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);
  } catch (error) {
    console.error('sitemap: database unreachable, emitting static routes only:', error);
  }

  const entries = (rows: Row[], prefix: string, priority: number, freq: 'weekly' | 'monthly') =>
    rows.map((r) => ({
      url: `${baseUrl}/${prefix}/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: freq,
      priority,
    })) as MetadataRoute.Sitemap;

  return [
    ...STATIC_PAGES.map((p) => ({ ...p, lastModified: new Date() })),
    ...entries(articles, 'article', 0.9, 'weekly'),
    ...entries(categories, 'category', 0.8, 'weekly'),
    ...entries(areas, 'area', 0.8, 'weekly'),
    ...entries(places, 'place', 0.7, 'monthly'),
  ];
}
