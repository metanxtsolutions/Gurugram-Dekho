import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorResponse } from '@/lib/utils';

/**
 * Authorization for API route handlers.
 *
 * Read endpoints stay public — they serve the public site. Every mutation goes
 * through `requireRole`, which returns either the caller or a response to
 * return immediately:
 *
 *   const auth = await requireRole(EDITORS);
 *   if ('error' in auth) return auth.error;
 *   // auth.user is now a verified caller
 */

export type Role = 'admin' | 'editor' | 'author' | 'contributor';

export type AuthedUser = {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
};

/** Manage taxonomy, places, and anyone's articles. */
export const EDITORS: Role[] = ['admin', 'editor'];
/** Can create articles; ownership is checked separately for edits. */
export const WRITERS: Role[] = ['admin', 'editor', 'author'];
/** Destructive operations on taxonomy. */
export const ADMINS: Role[] = ['admin'];

export async function getSessionUser(): Promise<AuthedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as AuthedUser;
}

export async function requireRole(
  allowed: Role[]
): Promise<{ user: AuthedUser } | { error: NextResponse }> {
  const user = await getSessionUser();

  if (!user) {
    return {
      error: NextResponse.json(errorResponse('Authentication required'), { status: 401 }),
    };
  }

  if (!allowed.includes(user.role)) {
    return {
      error: NextResponse.json(
        errorResponse('You do not have permission to perform this action'),
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Editors may act on any record; an author only on their own. Used for article
 * update/delete so writers cannot edit each other's work.
 */
export function canActOnOwned(user: AuthedUser, ownerId: string) {
  return EDITORS.includes(user.role) || user.id === ownerId;
}

export function forbidden(message = 'You can only modify your own content') {
  return NextResponse.json(errorResponse(message), { status: 403 });
}
