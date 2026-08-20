import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { SignupSchema, parseBody } from '@/lib/validation';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Unauthenticated and account-creating, so it needs the same protection
    // as the upload endpoint.
    const limit = await rateLimit(clientKey(request, 'signup'), {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        errorResponse('Too many sign-up attempts from this address. Try again later.'),
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      );
    }

    const body = await parseBody(request, SignupSchema);
    if ('error' in body) return body.error;
    const { email, password, name } = body.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('User already exists'),
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'contributor',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('POST /api/auth/signup error:', error);
    return NextResponse.json(errorResponse('Signup failed'), { status: 500 });
  }
}
