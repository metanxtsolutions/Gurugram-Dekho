import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { revalidatePlace } from '@/lib/revalidate';
import { requireRole, EDITORS } from '@/lib/api-auth';
import { PlaceUpdateSchema, assertExists, parseBody } from '@/lib/validation';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        area: true,
        image: true,
        editor: { select: { id: true, name: true } },
      },
    });

    if (!place) {
      return NextResponse.json(errorResponse('Place not found'), { status: 404 });
    }

    return NextResponse.json({ success: true, data: place });
  } catch (error) {
    console.error('GET /api/places/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to fetch place'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const body = await parseBody(request, PlaceUpdateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    const missing = await assertExists([
      {
        field: 'areaId',
        ids: data.areaId ? [data.areaId] : [],
        label: 'area',
        count: (ids) => prisma.area.count({ where: { id: { in: ids } } }),
      },
    ]);
    if (missing) return missing;

    const existing = await prisma.place.findUnique({
      where: { id },
      select: { area: { select: { slug: true } } },
    });
    if (!existing) {
      return NextResponse.json(errorResponse('Place not found'), { status: 404 });
    }

    const place = await prisma.place.update({
      where: { id },
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
        rating: data.rating,
        featured: data.featured,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
      include: { area: true, image: true },
    });

    // Purge both the new area page and the old one if the place moved.
    revalidatePlace(place.slug, place.area?.slug);
    if (existing.area?.slug && existing.area.slug !== place.area?.slug) {
      revalidatePlace(undefined, existing.area.slug);
    }

    return NextResponse.json({ success: true, data: place });
  } catch (error) {
    console.error('PATCH /api/places/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to update place'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const place = await prisma.place.delete({
      where: { id },
      select: { slug: true, area: { select: { slug: true } } },
    });

    revalidatePlace(place.slug, place.area?.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/places/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to delete place'), { status: 500 });
  }
}
