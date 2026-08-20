import prisma from '@/lib/db';

export interface InternalLink {
  title: string;
  url: string;
  type: 'article' | 'place' | 'area' | 'category';
}

/**
 * Get related articles for internal linking
 * Returns articles in the same category or with shared tags
 */
export async function getRelatedArticles(
  articleId: string,
  limit: number = 5
): Promise<InternalLink[]> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { categories: true, tags: true },
  });

  if (!article) return [];

  const categoryIds = article.categories.map((ac) => ac.categoryId);
  const tagIds = article.tags.map((at) => at.tagId);

  const related = await prisma.article.findMany({
    where: {
      id: { not: articleId },
      status: 'published',
      OR: [
        { categories: { some: { categoryId: { in: categoryIds } } } },
        { tags: { some: { tagId: { in: tagIds } } } },
      ],
    },
    select: { slug: true, title: true },
    take: limit,
  });

  return related.map((item) => ({
    title: item.title,
    url: `/article/${item.slug}`,
    type: 'article',
  }));
}

/**
 * Get places in the same area for internal linking
 */
export async function getAreaPlaces(areaId: string, limit: number = 8): Promise<InternalLink[]> {
  const places = await prisma.place.findMany({
    where: { areaId, status: 'published' },
    select: { slug: true, name: true },
    orderBy: { featured: 'desc' },
    take: limit,
  });

  return places.map((item) => ({
    title: item.name,
    url: `/place/${item.slug}`,
    type: 'place',
  }));
}

/**
 * Get articles mentioning an area
 */
export async function getAreaArticles(areaName: string, limit: number = 5): Promise<InternalLink[]> {
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      content: { contains: areaName },
    },
    select: { slug: true, title: true },
    take: limit,
  });

  return articles.map((item) => ({
    title: item.title,
    url: `/article/${item.slug}`,
    type: 'article',
  }));
}

/**
 * Get suggested links for an article based on keywords
 */
export async function getSuggestedLinks(keywords: string): Promise<InternalLink[]> {
  const keywordArray = keywords.split(',').map((k) => k.trim().toLowerCase());

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      OR: keywordArray.map((keyword) => ({
        content: { contains: keyword },
      })),
    },
    select: { slug: true, title: true },
    take: 5,
  });

  return articles.map((item) => ({
    title: item.title,
    url: `/article/${item.slug}`,
    type: 'article',
  }));
}
