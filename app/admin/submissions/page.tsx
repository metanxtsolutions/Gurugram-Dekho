import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { requirePageRole, EDITORS } from '@/lib/page-auth';
import { ReviewButtons } from './ReviewButtons';

export default async function SubmissionsPage() {
  await requirePageRole(EDITORS);

  const submissions = await prisma.photoSubmission.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 60,
    include: {
      place: { select: { name: true, slug: true } },
      area: { select: { name: true, slug: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  const pending = submissions.filter((s) => s.status === 'pending');
  const reviewed = submissions.filter((s) => s.status !== 'pending');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo submissions</h1>
      <p className="text-gray-500 mb-8">
        Reader photos. Approving creates a credited image and attaches it to the subject.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Pending
        <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-200 text-sm">
          {pending.length}
        </span>
      </h2>

      {pending.length === 0 ? (
        <p className="text-gray-500 mb-10">Nothing waiting for review.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {pending.map((s) => {
            const subject = s.place ?? s.area;
            const href = s.place ? `/place/${s.place.slug}` : `/area/${s.area?.slug}`;

            return (
              <div key={s.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={s.url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <Link href={href} className="font-bold text-gray-900 hover:text-orange-600">
                    {subject?.name ?? 'Unknown subject'}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {s.submitterName} · {s.submitterEmail}
                  </p>
                  {s.note && (
                    <p className="mt-2 text-sm text-gray-700 italic">&ldquo;{s.note}&rdquo;</p>
                  )}
                  <p className="mt-3 text-xs text-gray-400">
                    {s.width}×{s.height} · {Math.round(s.bytes / 1024)} KB ·{' '}
                    {s.grantedAt.toLocaleDateString('en-IN')}
                  </p>
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Licence they agreed to
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-gray-600">
                      {s.licenseGrant}
                    </p>
                  </details>

                  <ReviewButtons id={s.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewed.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Reviewed</h2>
          <table className="w-full bg-white rounded-lg shadow overflow-hidden text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Subject</th>
                <th className="px-5 py-3 text-left font-semibold">From</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Reviewed by</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reviewed.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3">{s.place?.name ?? s.area?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{s.submitterName}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        s.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{s.reviewedBy?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
