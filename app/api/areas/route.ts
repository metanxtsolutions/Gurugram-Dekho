import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { parsePagination, createPaginatedResponse, errorResponse } from '@/lib/utils';
import { revalidateArea } from '@/lib/revalidate';
import { requireRole, EDITORS } from '@/lib/api-auth';
import { AreaCreateSchema, assertExists, parseBody } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get('page');
    const limit = request.nextUrl.searchParams.get('limit');
    const parentOnly = request.nextUrl.searchParams.get('parentOnly') === 'true';
    const search = request.nextUrl.searchParams.get('search');

    const { skip, limit: pageLimit, page: pageNum } = parsePagination({ page, limit });

    const where: any = { isActive: true };
    if (parentOnly) {
      where.parentId = null;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [areas, total] = await Promise.all([
      prisma.area.findMany({
        where,
        include: {
          children: true,
          image: true,
          _count: {
            select: { places: true },
          },
        },
        orderBy: { order: 'asc' },
        skip: parentOnly ? undefined : skip,
        take: parentOnly ? undefined : pageLimit,
      }),
      prisma.area.count({ where }),
    ]);

    if (parentOnly) {
      return NextResponse.json({ success: true, data: areas });
    }

    const response = createPaginatedResponse(areas, total, pageNum, pageLimit);
    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/areas error:', error);
    return NextResponse.json(errorResponse('Failed to fetch areas'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const body = await parseBody(request, AreaCreateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    const missing = await assertExists([
      {
        field: 'parentId',
        ids: data.parentId ? [data.parentId] : [],
        label: 'parent area',
        count: (ids) => prisma.area.count({ where: { id: { in: ids } } }),
      },
    ]);
    if (missing) return missing;

    const area = await prisma.area.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type || 'area',
        order: data.order || 0,
        parentId: data.parentId,
        latitude: data.latitude,
        longitude: data.longitude,
        imageId: data.imageId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
      include: {
        image: true,
        children: true,
      },
    });

    revalidateArea(area.slug);

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error('POST /api/areas error:', error);
    return NextResponse.json(errorResponse('Failed to create area'), { status: 500 });
  }
}
