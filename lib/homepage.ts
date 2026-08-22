import 'server-only';
import prisma from '@/lib/db';
import {
  AREAS as FALLBACK_AREAS,
  CATEGORIES as FALLBACK_CATEGORIES,
  FEATURED as FALLBACK_FEATURED,
  LATEST as FALLBACK_LATEST,
  PLACES as FALLBACK_PLACES,
  type AreaCard,
  type CategoryTile,
  type PlaceItem,
  type Story,
} from '@/lib/content';

export type HomepageData = {
  featured: Story[];
  latest: Story[];
  areas: AreaCard[];
  places: PlaceItem[];
  categories: CategoryTile[];
  stats: { places: number; areas: number; guides: number };
  /** True when the page is rendering curated content because the DB had nothing. */
  usingFallback: boolean;
};

/**
 * Presentation-only metadata. The database stores an `icon` name per category;
 * the colour wash is a front-end concern, so it is mapped by slug here with a
 * neutral default for categories added later through the admin panel.
 */
const CATEGORY_TONES: Record<string, string> = {
  'food-dining': 'bg-brand-100 text-brand-700',
  'travel-places': 'bg-sky-100 text-sky-700',
  events: 'bg-violet-100 text-violet-700',
  'stays-accommodation': 'bg-emerald-100 text-emerald-700',
  'business-work': 'bg-amber-100 text-amber-700',
  shopping: 'bg-rose-100 text-rose-700',
  education: 'bg-indigo-100 text-indigo-700',
  lifestyle: 'bg-teal-100 text-teal-700',
};
const DEFAULT_TONE = 'bg-ink-100 text-ink-700';

const dateFmt = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

/** Estimate reading time from HTML when the article has no stored value. */
function estimateReadMins(content: string | null) {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: { url: string } | null;
  readMins: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  author: { name: string };
  categories: { category: { name: string; slug: string } }[];
};

function toStory(a: ArticleRow): Story {
  const category = a.categories[0]?.category;
  return {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? '',
    category: category?.name ?? 'Guides',
    categorySlug: category?.slug ?? '',
    image: a.featuredImage?.url ?? '',
    author: a.author.name,
    readMins: a.readMins ?? estimateReadMins(a.content),
    date: dateFmt.format(a.publishedAt ?? a.createdAt),
  };
}

const articleShape = {
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    featuredImage: { select: { url: true } },
    readMins: true,
    publishedAt: true,
    createdAt: true,
    author: { select: { name: true } },
    categories: {
      take: 1,
      select: { category: { select: { name: true, slug: true } } },
    },
  },
} as const;

export async function getHomepageData(): Promise<HomepageData> {
  try {
    const published = { status: 'published', isActive: true };

    // Featured first; whatever is short gets topped up from the latest pool.
    const [featuredRows, recentRows, areaRows, placeRows, categoryRows, placeCount, areaCount, guideCount] =
      await Promise.all([
        prisma.article.findMany({
          where: { ...published, featured: true },
          orderBy: { publishedAt: 'desc' },
          take: 4,
          ...articleShape,
        }),
        prisma.article.findMany({
          where: published,
          orderBy: { publishedAt: 'desc' },
          take: 12,
          ...articleShape,
        }),
        prisma.area.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
          take: 6,
          select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            description: true,
            image: { select: { url: true } },
            _count: { select: { places: true } },
          },
        }),
        prisma.place.findMany({
          where: { status: 'published', isActive: true },
          orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
          take: 4,
          select: {
            id: true,
            name: true,
            slug: true,
            cuisine: true,
            placeType: true,
            priceRange: true,
            rating: true,
            image: { select: { url: true } },
            area: { select: { name: true } },
          },
        }),
        prisma.category.findMany({
          where: { isActive: true, parentId: null },
          orderBy: { order: 'asc' },
          take: 8,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            _count: { select: { articles: true } },
          },
        }),
        prisma.place.count({ where: { status: 'published', isActive: true } }),
        prisma.area.count({ where: { isActive: true } }),
        prisma.article.count({ where: published }),
      ]);

    // Nothing published yet, show the curated set rather than an empty page.
    if (recentRows.length === 0 && categoryRows.length === 0) {
      return fallback();
    }

    const featuredIds = new Set(featuredRows.map((a) => a.id));
    const topUp = recentRows.filter((a) => !featuredIds.has(a.id));

    const featured = [...featuredRows, ...topUp].slice(0, 4);
    const featuredFinalIds = new Set(featured.map((a) => a.id));
    const latest = recentRows.filter((a) => !featuredFinalIds.has(a.id)).slice(0, 4);

    return {
      featured: featured.map(toStory),
      latest: latest.map(toStory),
      areas: areaRows.map((a) => ({
        name: a.name,
        slug: a.slug,
        tagline: a.tagline ?? a.description?.slice(0, 60) ?? '',
        image: a.image?.url ?? '',
        places: a._count.places,
      })),
      places: placeRows.map((p) => ({
        name: p.name,
        slug: p.slug,
        area: p.area?.name ?? 'Gurugram',
        cuisine: p.cuisine ?? p.placeType,
        priceRange: p.priceRange,
        rating: p.rating,
        image: p.image?.url ?? '',
      })),
      categories: categoryRows.map((c) => ({
        name: c.name,
        slug: c.slug,
        blurb: c.description ?? '',
        count: c._count.articles,
        tone: CATEGORY_TONES[c.slug] ?? DEFAULT_TONE,
        icon: c.icon ?? 'sparkles',
      })),
      stats: { places: placeCount, areas: areaCount, guides: guideCount },
      usingFallback: false,
    };
  } catch (error) {
    // A homepage that renders is better than a 500 if the database is briefly down.
    console.error('getHomepageData failed, serving curated content:', error);
    return fallback();
  }
}

function fallback(): HomepageData {
  return {
    featured: FALLBACK_FEATURED,
    latest: FALLBACK_LATEST,
    areas: FALLBACK_AREAS,
    places: FALLBACK_PLACES,
    categories: FALLBACK_CATEGORIES,
    stats: {
      places: FALLBACK_PLACES.length,
      areas: FALLBACK_AREAS.length,
      guides: FALLBACK_FEATURED.length + FALLBACK_LATEST.length,
    },
    usingFallback: true,
  };
}
