import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';
import { requirePageRole, EDITORS } from '@/lib/page-auth';

export default async function AreasPage() {
  await requirePageRole(EDITORS);

  const areas = await prisma.area.findMany({
    where: { parentId: null },
    include: {
      children: true,
      _count: {
        select: { places: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Areas</h1>
        <Link
          href="/admin/areas/create"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Create Area
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Places</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Sub-areas</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {areas.map((area) => (
              <tr key={area.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{area.name}</td>
                <td className="px-6 py-4 text-gray-600 capitalize">{area.type}</td>
                <td className="px-6 py-4 text-gray-600">{area._count.places}</td>
                <td className="px-6 py-4 text-gray-600">{area.children.length}</td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    href={`/admin/areas/${area.id}/edit`}
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
