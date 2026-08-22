import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PlaceCard } from '@/components/PlaceCard';
import { Icon } from '@/components/Icons';
import { ImageCredit } from '@/components/ImageCredit';
import { PhotoSubmitForm } from '@/components/PhotoSubmitForm';
import { Placeholder } from '@/components/Placeholder';
import { OpenStatus } from '@/components/place/OpenStatus';
import { HoursTable } from '@/components/place/HoursTable';
import { ActionBar } from '@/components/place/ActionBar';
import { getOpenState, weekSchedule } from '@/lib/opening-hours';

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

async function getPlace(slug: string) {
  return prisma.place.findUnique({
    where: { slug },
    include: {
      area: true,
      image: true,
      openingHours: true,
      editor: { select: { name: true } },
    },
  });
}

async function getNearby(areaId: string, excludeId: string) {
  return prisma.place.findMany({
    where: { areaId, id: { not: excludeId }, status: 'published' },
    include: { area: true, image: true, openingHours: true },
    orderBy: { rating: 'desc' },
    take: 4,
  });
}

/** Deep link that opens the native app on a phone and Maps on desktop. */
function directionsUrl(place: {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const target =
    place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : [place.name, place.address, 'Gurugram'].filter(Boolean).join(', ');

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlace(slug);
  if (!place) return { title: 'Place not found' };

  return {
    title: place.seoTitle || `${place.name}, ${place.area?.name ?? 'Gurugram'}`,
    description: place.seoDescription || place.description || undefined,
    alternates: { canonical: `/place/${place.slug}` },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = await getPlace(slug);
  if (!place) notFound();

  const nearby = await getNearby(place.areaId, place.id);
  const openState = getOpenState(place.openingHours, place.alwaysOpen);
  const mapsUrl = directionsUrl(place);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: place.name,
    description: place.description || undefined,
    address: place.address
      ? { '@type': 'PostalAddress', streetAddress: place.address, addressLocality: 'Gurugram' }
      : undefined,
    telephone: place.phone || undefined,
    url: place.website || undefined,
    priceRange: place.priceRange,
    // Structured hours feed the search-result rich card as well as the page.
    openingHoursSpecification: weekSchedule(place.openingHours)
      .filter((d) => d.intervals.length > 0)
      .map((d) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${d.name}`,
        opens: d.intervals[0].split(' – ')[0],
        closes: d.intervals[0].split(' – ')[1],
      })),
    ...(place.rating > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: place.rating, bestRating: 5 } }
      : {}),
    ...(place.latitude != null && place.longitude != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: place.latitude, longitude: place.longitude } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Full-bleed image, so the phone screen leads with the place itself. */}
      <div className="relative aspect-[4/3] sm:aspect-[21/9] lg:aspect-[21/8] bg-ink-100">
        {place.image?.url ? (
          <Image
            src={place.image.url}
            alt={place.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <Placeholder name={place.name} label={place.placeType} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 pb-5 sm:pb-8">
            <Breadcrumb
              tone="light"
              items={[
                { name: 'Home', href: '/' },
                ...(place.area ? [{ name: place.area.name, href: `/area/${place.area.slug}` }] : []),
                { name: place.name, href: `/place/${place.slug}` },
              ]}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-brand-500 text-white text-[11px] font-bold uppercase tracking-wide">
                {place.placeType}
              </span>
              {place.featured && (
                <span className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur text-white text-[11px] font-bold uppercase tracking-wide">
                  Editors&apos; pick
                </span>
              )}
            </div>
            <h1 className="display mt-2.5 text-white text-[2rem] sm:text-5xl">{place.name}</h1>
          </div>
        </div>
      </div>

      {/* Fact strip, the answers people came for, above the fold. */}
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <OpenStatus state={openState} />

            {place.rating > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                <Icon name="star" className="w-4 h-4 text-brand-500" />
                {place.rating.toFixed(1)}
              </span>
            )}
            <span className="text-sm font-semibold text-ink-700">{place.priceRange}</span>
            {place.cuisine && <span className="text-sm text-ink-600">{place.cuisine}</span>}
            {place.area && (
              <Link
                href={`/area/${place.area.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-600 transition-colors"
              >
                <Icon name="pin" className="w-4 h-4" />
                {place.area.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom padding leaves room for the sticky mobile action bar. */}
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-12 pb-28 lg:pb-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14">
          <div className="lg:col-span-7 min-w-0">
            {place.image && <ImageCredit image={place.image} className="mb-6 -mt-2" />}

            {place.description && (
              <>
                <h2 className="display-sm text-ink-950 text-xl sm:text-2xl mb-3">
                  About {place.name}
                </h2>
                <p className="text-[1.0625rem] leading-[1.75] text-ink-700">{place.description}</p>
              </>
            )}

            {place.specialties && (
              <div className="mt-8">
                <h3 className="font-bold text-ink-950 mb-3">Known for</h3>
                <div className="flex flex-wrap gap-2">
                  {place.specialties.split(',').map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-lg bg-ink-50 text-sm font-medium text-ink-700"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 lg:hidden">
              <PhotoSubmitForm subjectName={place.name} placeId={place.id} />
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-5">
            <ActionBar
              name={place.name}
              phone={place.phone}
              website={place.website}
              mapsUrl={mapsUrl}
              variant="inline"
            />

            <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 space-y-5">
              {place.address && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3"
                >
                  <Icon name="pin" className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-ink-400">Address</span>
                    <span className="block text-sm text-ink-800 group-hover:text-brand-600 transition-colors">
                      {place.address}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                      Get directions
                      <Icon name="arrow" className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </a>
              )}

              {place.phone && (
                <a href={`tel:${place.phone}`} className="group flex gap-3">
                  <Icon name="phone" className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" />
                  <span>
                    <span className="block text-xs font-semibold text-ink-400">Phone</span>
                    <span className="block text-sm text-ink-800 group-hover:text-brand-600 transition-colors">
                      {place.phone}
                    </span>
                  </span>
                </a>
              )}

              <div className="pt-5 border-t border-ink-100">
                <HoursTable intervals={place.openingHours} alwaysOpen={place.alwaysOpen} />
              </div>
            </div>

            {place.area && (
              <div className="rounded-2xl bg-ink-50 border border-ink-100 p-5 sm:p-6">
                <h3 className="eyebrow text-ink-400 mb-2">Neighbourhood</h3>
                <p className="font-bold text-ink-950">{place.area.name}</p>
                {place.area.tagline && (
                  <p className="mt-1 text-sm text-ink-500">{place.area.tagline}</p>
                )}
                <Link
                  href={`/area/${place.area.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Explore {place.area.name}
                  <Icon name="arrow" className="w-4 h-4" />
                </Link>
              </div>
            )}

            <div className="hidden lg:block">
              <PhotoSubmitForm subjectName={place.name} placeId={place.id} />
            </div>
          </aside>
        </div>

        {nearby.length > 0 && (
          <section className="mt-14 pt-12 border-t border-ink-100">
            <p className="eyebrow text-brand-600">Nearby</p>
            <h2 className="display-sm mt-2 mb-8 text-ink-950 text-2xl sm:text-3xl">
              More in {place.area?.name ?? 'Gurugram'}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {nearby.map((p) => (
                <PlaceCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  description={p.description ?? undefined}
                  placeType={p.placeType}
                  area={p.area ? { name: p.area.name, slug: p.area.slug } : undefined}
                  image={p.image ? { url: p.image.url } : undefined}
                  rating={p.rating}
                  priceRange={p.priceRange}
                  cuisine={p.cuisine ?? undefined}
                  openState={getOpenState(p.openingHours, p.alwaysOpen)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <ActionBar
        name={place.name}
        phone={place.phone}
        website={place.website}
        mapsUrl={mapsUrl}
        variant="sticky"
      />
    </>
  );
}
