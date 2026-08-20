import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';
import { requirePageRole, EDITORS } from '@/lib/page-auth';

export default async function PlacesPage() {
  await requirePageRole(EDITORS);

  const places = await prisma.place.findMany({
    include: {
      area: { select: { name: true } },
    },
    orderBy: { featured: 'desc' },
    take: 50,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Places</h1>
        <Link
          href="/admin/places/create"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Create Place
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Area</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {places.map((place) => (
              <tr key={place.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{place.name}</td>
                <td className="px-6 py-4 text-gray-600 capitalize">{place.placeType}</td>
                <td className="px-6 py-4 text-gray-600">{place.area.name}</td>
                <td className="px-6 py-4 text-gray-600">
                  {place.rating > 0 ? `${place.rating.toFixed(1)} ⭐` : '-'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      place.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {place.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    href={`/admin/places/${place.id}/edit`}
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
