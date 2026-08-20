import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { revalidateArea } from '@/lib/revalidate';
import { requireRole, ADMINS, EDITORS } from '@/lib/api-auth';
import { AreaUpdateSchema, assertExists, badRequest, parseBody } from '@/lib/validation';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        image: true,
        parent: true,
        children: true,
        _count: { select: { places: true } },
      },
    });

    if (!area) {
      return NextResponse.json(errorResponse('Area not found'), { status: 404 });
    }

    return NextResponse.json({ success: true, data: area });
  } catch (error) {
    console.error('GET /api/areas/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to fetch area'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const body = await parseBody(request, AreaUpdateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    if (data.parentId === id) {
      return badRequest('An area cannot be its own parent', {
        parentId: ['Choose a different parent area'],
      });
    }

    const missing = await assertExists([
      {
        field: 'parentId',
        ids: data.parentId ? [data.parentId] : [],
        label: 'parent area',
        count: (ids) => prisma.area.count({ where: { id: { in: ids } } }),
      },
    ]);
    if (missing) return missing;

    const existing = await prisma.area.findUnique({ where: { id }, select: { slug: true } });
    if (!existing) {
      return NextResponse.json(errorResponse('Area not found'), { status: 404 });
    }

    const area = await prisma.area.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        tagline: data.tagline,
        type: data.type,
        order: data.order,
        parentId: data.parentId || null,
        latitude: data.latitude,
        longitude: data.longitude,
        imageId: data.imageId,
        isActive: data.isActive,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
      include: { image: true, children: true },
    });

    revalidateArea(area.slug);
    if (existing.slug !== area.slug) revalidateArea(existing.slug);

    return NextResponse.json({ success: true, data: area });
  } catch (error) {
    console.error('PATCH /api/areas/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to update area'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const placeCount = await prisma.place.count({ where: { areaId: id } });
    if (placeCount > 0) {
      return NextResponse.json(
        errorResponse(
          `Cannot delete: ${placeCount} place(s) still belong to this area. Reassign them first.`
        ),
        { status: 409 }
      );
    }

    const area = await prisma.area.delete({ where: { id }, select: { slug: true } });
    revalidateArea(area.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/areas/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to delete area'), { status: 500 });
  }
}
