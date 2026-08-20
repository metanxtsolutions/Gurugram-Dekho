import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q') || '';
    const type = request.nextUrl.searchParams.get('type'); // article, place, area, all
    const limit = Math.min(50, parseInt(request.nextUrl.searchParams.get('limit') || '20', 10));

    if (!query || query.length < 2) {
      return NextResponse.json(errorResponse('Query must be at least 2 characters'), { status: 400 });
    }

    const searchWhere = {
      mode: 'insensitive' as const,
      contains: query,
    };

    const results: any = {
      articles: [],
      places: [],
      areas: [],
    };

    // Search articles
    if (!type || type === 'article' || type === 'all') {
      results.articles = await prisma.article.findMany({
        where: {
          status: 'published',
          OR: [
            { title: searchWhere },
            { excerpt: searchWhere },
            { seoKeywords: searchWhere },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          author: { select: { name: true } },
          featuredImage: { select: { url: true, alt: true } },
          publishedAt: true,
        },
        take: limit,
      });
    }

    // Search places
    if (!type || type === 'place' || type === 'all') {
      results.places = await prisma.place.findMany({
        where: {
          status: 'published',
          OR: [
            { name: searchWhere },
            { description: searchWhere },
            { address: searchWhere },
            { cuisine: searchWhere },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          placeType: true,
          area: { select: { name: true, slug: true } },
          image: true,
          rating: true,
        },
        take: limit,
      });
    }

    // Search areas
    if (!type || type === 'area' || type === 'all') {
      results.areas = await prisma.area.findMany({
        where: {
          isActive: true,
          name: searchWhere,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
        },
        take: limit,
      });
    }

    // Log search for analytics
    await prisma.searchLog.create({
      data: {
        query,
        category: type,
        results: Object.values(results).flat().length,
      },
    }).catch(console.error); // Don't fail if logging fails

    return NextResponse.json({
      success: true,
      data: results,
      total: Object.values(results).flat().length,
    });
  } catch (error) {
    console.error('GET /api/search error:', error);
    return NextResponse.json(errorResponse('Search failed'), { status: 500 });
  }
}
