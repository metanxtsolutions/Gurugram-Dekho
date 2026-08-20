import prisma from '@/lib/db';
import Link from 'next/link';
import { requirePageRole, EDITORS } from '@/lib/page-auth';

export default async function CategoriesPage() {
  await requirePageRole(EDITORS);

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
      _count: { select: { articles: true } },
    },
    orderBy: { order: 'asc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Link
          href="/admin/categories/create"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Create Category
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Articles</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Subcategories</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-gray-600">{category._count.articles}</td>
                <td className="px-6 py-4 text-gray-600">{category.children.length}</td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
