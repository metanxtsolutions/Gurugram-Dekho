import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { revalidateArticle } from '@/lib/revalidate';
import { requireRole, WRITERS, canActOnOwned, forbidden, getSessionUser } from '@/lib/api-auth';
import { ArticleUpdateSchema, assertExists, parseBody } from '@/lib/validation';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        areas: { include: { area: true } },
        images: { include: { image: true }, orderBy: { order: 'asc' } },
      },
    });

    if (!article) {
      return NextResponse.json(errorResponse('Article not found'), { status: 404 });
    }

    // Increment view count
    await prisma.article.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    const viewer = await getSessionUser();
    const canEdit = viewer ? canActOnOwned(viewer, article.authorId) : false;

    return NextResponse.json({ success: true, data: article, canEdit });
  } catch (error) {
    console.error('GET /api/articles/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to fetch article'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    const auth = await requireRole(WRITERS);
    if ('error' in auth) return auth.error;

    const body = await parseBody(request, ArticleUpdateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    const missing = await assertExists([
      {
        field: 'areaIds',
        ids: data.areaIds ?? [],
        label: 'area',
        count: (ids) => prisma.area.count({ where: { id: { in: ids } } }),
      },
      {
        field: 'featuredImageId',
        ids: data.featuredImageId ? [data.featuredImageId] : [],
        label: 'image',
        count: (ids) => prisma.image.count({ where: { id: { in: ids } } }),
      },
    ]);
    if (missing) return missing;

    const existing = await prisma.article.findUnique({
      where: { id: params.id },
      select: {
        slug: true,
        authorId: true,
        categories: { select: { category: { select: { slug: true } } } },
        areas: { select: { area: { select: { id: true, slug: true } } } },
      },
    });
    if (!existing) {
      return NextResponse.json(errorResponse('Article not found'), { status: 404 });
    }
    if (!canActOnOwned(auth.user, existing.authorId)) return forbidden();

    if (data.slug && data.slug !== existing.slug) {
      const clash = await prisma.article.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', fields: { slug: ['That slug is already in use'] } },
          { status: 409 }
        );
      }
    }

    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        featuredImageId: data.featuredImageId,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        canonicalUrl: data.canonicalUrl,
        featured: data.featured,
        readMins: data.readMins,
      },
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    // Area coverage is replaced wholesale when the payload declares it.
    const previousAreas = existing.areas.map((a) => a.area);
    let currentAreaSlugs = previousAreas.map((a) => a.slug);

    if (Array.isArray(data.areaIds)) {
      const areaIds: string[] = data.areaIds;

      await prisma.articleArea.deleteMany({
        where: { articleId: params.id, areaId: { notIn: areaIds } },
      });
      if (areaIds.length > 0) {
        await prisma.articleArea.createMany({
          data: areaIds.map((areaId) => ({ articleId: params.id, areaId })),
          skipDuplicates: true,
        });
      }

      currentAreaSlugs = (
        await prisma.area.findMany({
          where: { id: { in: areaIds } },
          select: { slug: true },
        })
      ).map((a) => a.slug);
    }

    // Purge the article, its categories and areas — old and new, so a page it
    // was removed from stops advertising it.
    const categorySlugs = article.categories.map((c) => c.category.slug);
    const previousSlugs = existing.categories.map((c) => c.category.slug);
    revalidateArticle(
      article.slug,
      [...new Set([...categorySlugs, ...previousSlugs])],
      [...new Set([...currentAreaSlugs, ...previousAreas.map((a) => a.slug)])]
    );
    if (existing.slug !== article.slug) revalidateArticle(existing.slug);

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('PATCH /api/articles/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to update article'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    const auth = await requireRole(WRITERS);
    if ('error' in auth) return auth.error;

    const target = await prisma.article.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });
    if (!target) {
      return NextResponse.json(errorResponse('Article not found'), { status: 404 });
    }
    if (!canActOnOwned(auth.user, target.authorId)) return forbidden();

    const article = await prisma.article.delete({
      where: { id: params.id },
      select: {
        slug: true,
        categories: { select: { category: { select: { slug: true } } } },
        areas: { select: { area: { select: { slug: true } } } },
      },
    });

    revalidateArticle(
      article.slug,
      article.categories.map((c) => c.category.slug),
      article.areas.map((a) => a.area.slug)
    );

    return NextResponse.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    console.error('DELETE /api/articles/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to delete article'), { status: 500 });
  }
}
