import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { requireRole, ADMINS } from '@/lib/api-auth';
import { UserCreateSchema, parseBody } from '@/lib/validation';

/** Password hashes are never included in a response. */
const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  bio: true,
  createdAt: true,
} as const;

export async function GET() {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: SAFE_SELECT,
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(errorResponse('Failed to fetch users'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const body = await parseBody(request, UserCreateSchema);
    if ('error' in body) return body.error;
    const data = body.data;

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

    const user = await prisma.user.create({
      data: { ...data, password: await hash(data.password, 10) },
      select: SAFE_SELECT,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(errorResponse('Failed to create user'), { status: 500 });
  }
}
