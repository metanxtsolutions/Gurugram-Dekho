import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { requireRole, ADMINS } from '@/lib/api-auth';
import { UserUpdateSchema, badRequest, parseBody } from '@/lib/validation';

type Context = { params: Promise<{ id: string }> };

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  bio: true,
  createdAt: true,
} as const;

export async function GET(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;
    const user = await prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });

    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to fetch user'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const body = await parseBody(request, UserUpdateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });
    if (!existing) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    // Guard against an admin locking themselves out of the panel.
    const self = auth.user.id === id;
    if (self && data.role && data.role !== 'admin') {
      return badRequest('You cannot change your own role', {
        role: ['Ask another admin to change your role'],
      });
    }
    if (self && data.isActive === false) {
      return badRequest('You cannot deactivate your own account', {
        isActive: ['Ask another admin to deactivate this account'],
      });
    }

    if (data.email && data.email !== existing.email) {
      const clash = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', fields: { email: ['That email is already registered'] } },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        bio: data.bio,
        // Only rewrite the password when a new one was supplied.
        ...(data.password ? { password: await hash(data.password, 10) } : {}),
      },
      select: SAFE_SELECT,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to update user'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    if (auth.user.id === id) {
      return badRequest('You cannot delete your own account');
    }

    const articleCount = await prisma.article.count({ where: { authorId: id } });
    if (articleCount > 0) {
      return NextResponse.json(
        errorResponse(
          `Cannot delete: ${articleCount} article(s) are authored by this user. Reassign them first.`
        ),
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json(errorResponse('Failed to delete user'), { status: 500 });
  }
}
