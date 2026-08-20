import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { revalidateCategory } from '@/lib/revalidate';
import { requireRole, EDITORS } from '@/lib/api-auth';
import { CategoryCreateSchema, assertExists, parseBody } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const includeParent = request.nextUrl.searchParams.get('includeParent') === 'true';
    const parentOnly = request.nextUrl.searchParams.get('parentOnly') === 'true';

    const where: any = { isActive: true };
    if (parentOnly) {
      where.parentId = null;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: includeParent,
        children: true,
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(errorResponse('Failed to fetch categories'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const body = await parseBody(request, CategoryCreateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    const missing = await assertExists([
      {
        field: 'parentId',
        ids: data.parentId ? [data.parentId] : [],
        label: 'parent category',
        count: (ids) => prisma.category.count({ where: { id: { in: ids } } }),
      },
    ]);
    if (missing) return missing;

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        order: data.order || 0,
        parentId: data.parentId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
      include: {
        children: true,
        _count: {
          select: { articles: true },
        },
      },
    });

    revalidateCategory(category.slug);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(errorResponse('Failed to create category'), { status: 500 });
  }
}
