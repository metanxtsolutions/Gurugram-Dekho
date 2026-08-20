import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { parsePagination, createPaginatedResponse, errorResponse } from '@/lib/utils';
import { revalidateArticle } from '@/lib/revalidate';
import { requireRole, WRITERS } from '@/lib/api-auth';
import { ArticleCreateSchema, assertExists, parseBody } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const { skip, limit: pageLimit, page: pageNum } = parsePagination({ page, limit });

    // Build where clause
    const where: any = {
      status: status || undefined,
    };

    if (featured === 'true') {
      where.featured = true;
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageLimit,
      }),
      prisma.article.count({ where }),
    ]);

    const response = createPaginatedResponse(articles, total, pageNum, pageLimit);
    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/articles error:', error);
    return NextResponse.json(errorResponse('Failed to fetch articles'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(WRITERS);
    if ('error' in auth) return auth.error;

    const body = await parseBody(request, ArticleCreateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    // Referenced records must exist, or Prisma raises an opaque FK 500.
    const missing = await assertExists([
      {
        field: 'areaIds',
        ids: data.areaIds ?? [],
        label: 'area',
        count: (ids) => prisma.area.count({ where: { id: { in: ids } } }),
      },
      {
        field: 'categoryId',
        ids: data.categoryId ? [data.categoryId] : [],
        label: 'category',
        count: (ids) => prisma.category.count({ where: { id: { in: ids } } }),
      },
      {
        field: 'featuredImageId',
        ids: data.featuredImageId ? [data.featuredImageId] : [],
        label: 'image',
        count: (ids) => prisma.image.count({ where: { id: { in: ids } } }),
      },
    ]);
    if (missing) return missing;

    const existingSlug = await prisma.article.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', fields: { slug: ['That slug is already in use'] } },
        { status: 409 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        authorId: auth.user.id,
        status: data.status || 'draft',
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        canonicalUrl: data.canonicalUrl,
        featuredImageId: data.featuredImageId,
        featured: data.featured ?? false,
        readMins: data.readMins,
      },
      include: {
        author: true,
        categories: { include: { category: true } },
      },
    });

    if (data.categoryId) {
      await prisma.articleCategory.create({
        data: { articleId: article.id, categoryId: data.categoryId },
      });
    }

    // Area coverage, if the editor selected any.
    const areaIds: string[] = data.areaIds ?? [];
    if (areaIds.length > 0) {
      await prisma.articleArea.createMany({
        data: areaIds.map((areaId) => ({ articleId: article.id, areaId })),
        skipDuplicates: true,
      });
    }

    const areaSlugs = areaIds.length
      ? (
          await prisma.area.findMany({
            where: { id: { in: areaIds } },
            select: { slug: true },
          })
        ).map((a) => a.slug)
      : [];

    revalidateArticle(
      article.slug,
      article.categories.map((c) => c.category.slug),
      areaSlugs
    );

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('POST /api/articles error:', error);
    return NextResponse.json(errorResponse('Failed to create article'), { status: 500 });
  }
}
