import { ReactNode } from 'react';
import Link from 'next/link';
import { requirePageRole, STAFF, EDITORS, ADMINS } from '@/lib/page-auth';
import type { Role } from '@/lib/api-auth';

const NAV: { href: string; label: string; icon: string; roles: Role[] }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: STAFF },
  { href: '/admin/articles', label: 'Articles', icon: '📝', roles: STAFF },
  { href: '/admin/images', label: 'Images', icon: '🖼️', roles: EDITORS },
  { href: '/admin/submissions', label: 'Submissions', icon: '📥', roles: EDITORS },
  { href: '/admin/places', label: 'Places', icon: '📍', roles: EDITORS },
  { href: '/admin/areas', label: 'Areas', icon: '🗺️', roles: EDITORS },
  { href: '/admin/categories', label: 'Categories', icon: '📂', roles: EDITORS },
  { href: '/admin/users', label: 'Users', icon: '👥', roles: ADMINS },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️', roles: ADMINS },
];

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrator',
  editor: 'Editor',
  author: 'Author',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Authors belong here — they can write and manage their own articles.
  // Contributors have no write permission anywhere, so they are sent away.
  const user = await requirePageRole(STAFF);

  const links = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-2xl font-bold">
            Admin Panel
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {user.name}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-200">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </span>
            <Link href="/" className="text-sm text-gray-300 hover:text-white">
              View site
            </Link>
            <a href="/api/auth/signout" className="text-sm text-gray-300 hover:text-white">
              Logout
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
          <nav className="space-y-2">
            {links.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </nav>

          {user.role === 'author' && (
            <p className="mt-6 px-4 py-3 rounded bg-gray-700/60 text-xs leading-relaxed text-gray-300">
              You can write and edit your own articles. Ask an editor for changes to places,
              areas or categories.
            </p>
          )}
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 transition"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
