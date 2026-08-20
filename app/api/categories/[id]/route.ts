import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { revalidateCategory } from '@/lib/revalidate';
import { requireRole, ADMINS, EDITORS } from '@/lib/api-auth';
import { CategoryUpdateSchema, assertExists, badRequest, parseBody } from '@/lib/validation';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { articles: true } },
      },
    });

    if (!category) {
      return NextResponse.json(errorResponse('Category not found'), { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to fetch category'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const body = await parseBody(request, CategoryUpdateSchema);
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

    const existing = await prisma.category.findUnique({ where: { id }, select: { slug: true } });
    if (!existing) {
      return NextResponse.json(errorResponse('Category not found'), { status: 404 });
    }

    if (data.parentId === id) {
      return badRequest('A category cannot be its own parent', {
        parentId: ['Choose a different parent category'],
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        order: data.order,
        parentId: data.parentId || null,
        isActive: data.isActive,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
      include: { children: true, _count: { select: { articles: true } } },
    });

    revalidateCategory(category.slug);
    if (existing.slug !== category.slug) revalidateCategory(existing.slug);

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('PATCH /api/categories/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to update category'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const articleCount = await prisma.articleCategory.count({ where: { categoryId: id } });
    if (articleCount > 0) {
      return NextResponse.json(
        errorResponse(
          `Cannot delete: ${articleCount} article(s) are filed under this category. Recategorise them first.`
        ),
        { status: 409 }
      );
    }

    const category = await prisma.category.delete({ where: { id }, select: { slug: true } });
    revalidateCategory(category.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to delete category'), { status: 500 });
  }
}
