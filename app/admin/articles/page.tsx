import prisma from '@/lib/db';
import Link from 'next/link';
import { requirePageRole, STAFF, canManageContent } from '@/lib/page-auth';

export default async function ArticlesPage() {
  const user = await requirePageRole(STAFF);
  const isEditor = canManageContent(user);

  // Authors only manage their own work; editors and admins see everything.
  const articles = await prisma.article.findMany({
    where: isEditor ? {} : { authorId: user.id },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditor
              ? `${articles.length} article${articles.length === 1 ? '' : 's'} across all authors`
              : `Your articles (${articles.length})`}
          </p>
        </div>
        <Link
          href="/admin/articles/create"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Create Article
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Title</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Author</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Views</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900 line-clamp-1">{article.title}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{article.author.name}</td>
                <td className="px-6 py-4 text-gray-600">
                  {article.categories[0]?.category.name || '-'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      article.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{article.viewCount.toLocaleString()}</td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
                  >
                    Edit
                  </Link>
                  <button className="text-red-500 hover:text-red-600 font-semibold text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No articles yet</p>
          <Link
            href="/admin/articles/create"
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            Create the first article
          </Link>
        </div>
      )}
    </div>
  );
}
