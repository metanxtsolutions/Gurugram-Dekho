import Link from 'next/link';
import prisma from '@/lib/db';
import { requirePageRole, STAFF, canManageContent } from '@/lib/page-auth';

export default async function DashboardPage() {
  const user = await requirePageRole(STAFF);
  const isEditor = canManageContent(user);
  const isAdmin = user.role === 'admin';

  const [articleCount, myArticles, myDrafts, placeCount, areaCount, userCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { authorId: user.id } }),
      prisma.article.count({ where: { authorId: user.id, status: 'draft' } }),
      prisma.place.count(),
      prisma.area.count(),
      prisma.user.count(),
    ]);

  // Authors see their own workload; editors see the whole catalogue.
  const stats = isEditor
    ? [
        { label: 'Articles', value: articleCount, icon: '📝' },
        { label: 'Places', value: placeCount, icon: '📍' },
        { label: 'Areas', value: areaCount, icon: '🗺️' },
        { label: 'Users', value: userCount, icon: '👥' },
      ]
    : [
        { label: 'Your articles', value: myArticles, icon: '📝' },
        { label: 'Your drafts', value: myDrafts, icon: '✏️' },
        { label: 'Areas to cover', value: areaCount, icon: '🗺️' },
      ];

  // Only offer actions this role is actually allowed to complete.
  const actions = [
    { href: '/admin/articles/create', label: 'New Article', icon: '➕', show: true },
    { href: '/admin/places/create', label: 'New Place', icon: '➕', show: isEditor },
    { href: '/admin/areas/create', label: 'New Area', icon: '➕', show: isEditor },
    { href: '/admin/categories/create', label: 'New Category', icon: '➕', show: isEditor },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️', show: isAdmin },
  ].filter((a) => a.show);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Welcome back, {user.name}!
      </h1>
      <p className="text-gray-500 mb-8">
        {isEditor
          ? 'You have full access to content and taxonomy.'
          : 'Write new guides and manage the ones you have published.'}
      </p>

      <div
        className={`grid grid-cols-1 gap-6 mb-8 ${
          stats.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
        }`}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="p-4 text-center border rounded hover:bg-orange-50 transition"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="font-semibold text-gray-900">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
