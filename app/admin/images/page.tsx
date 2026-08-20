import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { requirePageRole, EDITORS } from '@/lib/page-auth';
import { licenseLabel, sourceLabel, licenseRequiresCredit } from '@/lib/image-license';

export default async function ImagesPage() {
  await requirePageRole(EDITORS);

  const [images, placesNeeding, areasNeeding] = await Promise.all([
    prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        _count: { select: { places: true, areas: true, articles: true } },
      },
    }),
    // Slots that make a factual claim but hold an illustrative photo.
    prisma.place.findMany({
      where: { image: { depicts: 'illustrative' } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.area.findMany({
      where: { image: { depicts: 'illustrative' } },
      select: { id: true, name: true, slug: true },
      orderBy: { order: 'asc' },
    }),
  ]);

  const needingCount = placesNeeding.length + areasNeeding.length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Image library</h1>
      <p className="text-gray-500 mb-8">
        Every image records where it came from and what it is allowed to be used for.
      </p>

      {/* The replacement queue is the working list, so it leads. */}
      <section className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-bold text-amber-900">
          Needs an authentic photo
          <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-200 text-sm">
            {needingCount}
          </span>
        </h2>
        <p className="mt-1 text-sm text-amber-800">
          These pages claim to show a specific place, but hold an illustrative image.
          Ask the venue for a photo, or fall back to the designed placeholder.
        </p>

        {needingCount === 0 ? (
          <p className="mt-4 text-sm text-amber-900">Nothing outstanding.</p>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {placesNeeding.map((p) => (
              <Link
                key={p.id}
                href={`/place/${p.slug}`}
                className="text-amber-900 hover:underline"
              >
                📍 {p.name}
              </Link>
            ))}
            {areasNeeding.map((a) => (
              <Link
                key={a.id}
                href={`/area/${a.slug}`}
                className="text-amber-900 hover:underline"
              >
                🗺️ {a.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((img) => {
          const uses = img._count.places + img._count.areas + img._count.articles;
          const missingCredit = licenseRequiresCredit(img.license) && !img.credit;

          return (
            <div key={img.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={img.url}
                  alt={img.alt ?? ''}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold ${
                    img.depicts === 'exact'
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {img.depicts === 'exact' ? 'Authentic' : 'Illustrative'}
                </span>
                {img.status !== 'approved' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-gray-900/80 text-white text-[11px] capitalize">
                    {img.status}
                  </span>
                )}
              </div>

              <dl className="p-4 space-y-1.5 text-xs">
                <Row label="Source" value={sourceLabel(img.source)} />
                <Row label="Licence" value={licenseLabel(img.license)} />
                <Row
                  label="Credit"
                  value={
                    img.credit ?? (
                      <span className={missingCredit ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                        {missingCredit ? 'required — missing' : 'not required'}
                      </span>
                    )
                  }
                />
                <Row label="Used on" value={`${uses} page${uses === 1 ? '' : 's'}`} />
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-400 shrink-0">{label}</dt>
      <dd className="text-right text-gray-800 truncate">{value}</dd>
    </div>
  );
}
