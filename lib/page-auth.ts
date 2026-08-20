import { redirect } from 'next/navigation';
import { getSessionUser, type AuthedUser, type Role } from '@/lib/api-auth';

/**
 * Server-component guards for the admin pages.
 *
 * The API is the real security boundary — these mirror it so a user never
 * lands on a screen whose every action would be rejected, and so hiding a nav
 * link is never the only thing standing between a role and a page.
 */

/** Everyone who may open the admin panel at all. */
export const STAFF: Role[] = ['admin', 'editor', 'author'];
/** Manage taxonomy, places and other people's content. */
export const EDITORS: Role[] = ['admin', 'editor'];
/** User management and site settings. */
export const ADMINS: Role[] = ['admin'];

export async function requirePageRole(allowed: Role[]): Promise<AuthedUser> {
  const user = await getSessionUser();

  if (!user) redirect('/auth/login');

  if (!allowed.includes(user.role)) {
    // Signed in but not entitled — send staff back to their dashboard and
    // everyone else out to the public site.
    redirect(STAFF.includes(user.role) ? '/admin/dashboard' : '/');
  }

  return user;
}

export function canManageContent(user: AuthedUser) {
  return EDITORS.includes(user.role);
}
