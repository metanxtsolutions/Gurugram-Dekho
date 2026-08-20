import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { parsePagination, createPaginatedResponse, errorResponse } from '@/lib/utils';
import { revalidatePlace } from '@/lib/revalidate';
import { requireRole, EDITORS } from '@/lib/api-auth';
import { PlaceCreateSchema, assertExists, parseBody } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get('page');
    const limit = request.nextUrl.searchParams.get('limit');
    const area = request.nextUrl.searchParams.get('area');
    const type = request.nextUrl.searchParams.get('type');
    const featured = request.nextUrl.searchParams.get('featured');
    const search = request.nextUrl.searchParams.get('search');

    const { skip, limit: pageLimit, page: pageNum } = parsePagination({ page, limit });

    const where: any = {
      status: 'published',
    };

    if (featured === 'true') {
      where.featured = true;
    }

    if (area) {
      where.area = {
        slug: area,
      };
    }

    if (type) {
      where.placeType = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        include: {
          area: true,
          image: true,
          editor: { select: { id: true, name: true } },
        },
        orderBy: { featured: 'desc' },
        skip,
        take: pageLimit,
      }),
      prisma.place.count({ where }),
    ]);

    const response = createPaginatedResponse(places, total, pageNum, pageLimit);
    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/places error:', error);
    return NextResponse.json(errorResponse('Failed to fetch places'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const body = await parseBody(request, PlaceCreateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    const missing = await assertExists([
      {
        field: 'areaId',
        ids: [data.areaId],
        label: 'area',
        count: (ids) => prisma.area.count({ where: { id: { in: ids } } }),
      },
    ]);
    if (missing) return missing;

    const place = await prisma.place.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        placeType: data.placeType,
        areaId: data.areaId,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        website: data.website,
        email: data.email,
        hours: data.hours,
        priceRange: data.priceRange,
        cuisine: data.cuisine,
        specialties: data.specialties,
        rating: data.rating || 0,
        editorId: auth.user.id,
        imageId: data.imageId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
      include: {
        area: true,
        image: true,
        editor: true,
      },
    });

    revalidatePlace(place.slug, place.area?.slug);

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error('POST /api/places error:', error);
    return NextResponse.json(errorResponse('Failed to create place'), { status: 500 });
  }
}
