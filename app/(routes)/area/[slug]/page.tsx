import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PlaceCard } from '@/components/PlaceCard';
import { PhotoHero } from '@/components/PhotoHero';
import { ArticleCard } from '@/components/ArticleCard';
import { Icon } from '@/components/Icons';
import { NewsletterCard, SidebarCard } from '@/components/Sidebar';
import { PhotoSubmitForm } from '@/components/PhotoSubmitForm';
import { getOpenState } from '@/lib/opening-hours';

interface AreaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}

async function getArea(slug: string) {
  return prisma.area.findUnique({
    where: { slug },
    include: { parent: true, children: true, image: true },
  });
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = await getArea(slug);
  if (!area) return { title: 'Area not found' };

  return {
    title: area.seoTitle || `${area.name}, Gurugram`,
    description:
      area.seoDescription ||
      area.description ||
      `Places, restaurants and guides in ${area.name}, Gurugram.`,
    alternates: { canonical: `/area/${area.slug}` },
  };
}

export default async function AreaPage({ params, searchParams }: AreaPageProps) {
  const { slug } = await params;
  const { type } = await searchParams;

  const area = await getArea(slug);
  if (!area) notFound();

  const [places, allTypes, nearby, guides, topRated] = await Promise.all([
    prisma.place.findMany({
      where: { areaId: area.id, status: 'published', ...(type ? { placeType: type } : {}) },
      include: { area: true, image: true, openingHours: true },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
      take: 24,
    }),
    // Full type list, independent of the active filter, so chips never vanish.
    prisma.place.groupBy({
      by: ['placeType'],
      where: { areaId: area.id, status: 'published' },
      _count: { placeType: true },
      orderBy: { _count: { placeType: 'desc' } },
    }),
    prisma.area.findMany({
      where: { isActive: true, id: { not: area.id } },
      orderBy: { order: 'asc' },
      take: 6,
      select: { id: true, name: true, slug: true, tagline: true, _count: { select: { places: true } } },
    }),
    // Guides explicitly tagged as covering this area.
    prisma.article.findMany({
      where: {
        status: 'published',
        isActive: true,
        areas: { some: { areaId: area.id } },
      },
      include: {
        author: { select: { name: true } },
        categories: { include: { category: true } },
        featuredImage: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    }),
    prisma.place.findFirst({
      where: { areaId: area.id, status: 'published' },
      orderBy: { rating: 'desc' },
      select: { name: true, slug: true, rating: true },
    }),
  ]);

  const totalPlaces = allTypes.reduce((sum, t) => sum + t._count.placeType, 0);
  const priceCounts = places.reduce<Record<string, number>>((acc, p) => {
    acc[p.priceRange] = (acc[p.priceRange] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* The dark cinematic band this replaced belonged to the old direction,
          and its muted tokens rendered dark-on-dark after the theme pass. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5">
        <Breadcrumb
          items={[
            { name: 'Home', href: '/' },
            ...(area.parent ? [{ name: area.parent.name, href: `/area/${area.parent.slug}` }] : []),
            { name: area.name, href: `/area/${area.slug}` },
          ]}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5">
        <PhotoHero
          image={area.image?.url ?? null}
          name={area.name}
          label={area.type ?? undefined}
          priority
          size="sm"
        >
          <p className="eyebrow text-white/70 capitalize">{area.type} · Gurugram</p>
          <h1 className="display mt-2.5 text-white text-[2rem] md:text-[3rem]">{area.name}</h1>
          {area.tagline && (
            <p className="mt-2.5 text-[15px] md:text-[17px] text-brand-300 font-medium">
              {area.tagline}
            </p>
          )}
          {area.description && (
            <p className="mt-2.5 text-[14px] md:text-[16px] text-white/80 leading-relaxed max-w-2xl">
              {area.description}
            </p>
          )}
        </PhotoHero>

        {/* Stats sit under the photo so they stay legible whatever the image */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="pin" className="w-4 h-4 text-brand-500" />
            {totalPlaces} {totalPlaces === 1 ? 'place' : 'places'}
          </span>
          <span>
            {allTypes.length} {allTypes.length === 1 ? 'category' : 'categories'}
          </span>
          {topRated && topRated.rating > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="star" className="w-3.5 h-3.5 text-brand-500" />
              Top rated:{' '}
              <Link
                href={`/place/${topRated.slug}`}
                className="font-medium text-fg hover:text-brand-600 underline underline-offset-2 transition-colors"
              >
                {topRated.name}
              </Link>
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Main column */}
          <div className="lg:col-span-8 min-w-0">
            <div className="flex items-end justify-between gap-6 mb-7">
              <div>
                <p className="eyebrow text-brand-600">Directory</p>
                <h2 className="display-sm mt-2.5 text-fg text-3xl">
                  Places in {area.name}
                </h2>
              </div>
            </div>

            {allTypes.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <FilterChip href={`/area/${area.slug}`} active={!type}>
                  All <span className="text-xs opacity-60">{totalPlaces}</span>
                </FilterChip>
                {allTypes.map((t) => (
                  <FilterChip
                    key={t.placeType}
                    href={`/area/${area.slug}?type=${encodeURIComponent(t.placeType)}`}
                    active={type === t.placeType}
                  >
                    {t.placeType} <span className="text-xs opacity-60">{t._count.placeType}</span>
                  </FilterChip>
                ))}
              </div>
            )}

            {places.length === 0 ? (
              <div className="rounded-card border border-dashed border-line bg-card-2 px-8 py-16 text-center">
                <h3 className="display-sm text-fg text-xl">
                  {type ? `No ${type} listings here yet` : 'No places listed yet'}
                </h3>
                <p className="mt-2 text-fg-subtle">
                  We&apos;re still mapping {area.name}. Check back soon.
                </p>
                {type && (
                  <Link
                    href={`/area/${area.slug}`}
                    className="mt-6 inline-flex px-5 py-2.5 rounded-pill bg-brand-500 hover:bg-brand-400 text-ink-950 text-sm font-semibold transition-colors"
                  >
                    Show all places
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {places.map((p) => (
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
            )}

            {guides.length > 0 && (
              <section className="mt-16 pt-12 border-t border-line">
                <p className="eyebrow text-brand-600">Read first</p>
                <h2 className="display-sm mt-2.5 mb-8 text-fg text-2xl">
                  Guides about {area.name}
                </h2>
                <div className="grid sm:grid-cols-3 gap-8">
                  {guides.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.id}
                      title={a.title}
                      slug={a.slug}
                      excerpt={a.excerpt ?? undefined}
                      publishedAt={a.publishedAt ?? undefined}
                      author={a.author}
                      featuredImage={a.featuredImage}
                      category={a.categories[0]?.category}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <SidebarCard title={`About ${area.name}`}>
              <dl className="space-y-3.5 text-sm">
                <Row label="Type" value={<span className="capitalize">{area.type}</span>} />
                <Row label="Places listed" value={String(totalPlaces)} />
                {Object.keys(priceCounts).length > 0 && (
                  <Row
                    label="Price range"
                    value={Object.keys(priceCounts).sort((a, b) => a.length - b.length).join(' · ')}
                  />
                )}
                {area.latitude != null && area.longitude != null && (
                  <Row
                    label="Coordinates"
                    value={
                      <span className="font-mono text-xs">
                        {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
                      </span>
                    }
                  />
                )}
                {area.children.length > 0 && (
                  <Row label="Sub-areas" value={String(area.children.length)} />
                )}
              </dl>
            </SidebarCard>

            {allTypes.length > 0 && (
              <SidebarCard title="What's here">
                <ul className="-my-1">
                  {allTypes.map((t) => (
                    <li key={t.placeType}>
                      <Link
                        href={`/area/${area.slug}?type=${encodeURIComponent(t.placeType)}`}
                        className="flex items-center justify-between gap-3 py-2.5 text-[15px] font-medium text-fg-muted hover:text-brand-600 transition-colors"
                      >
                        <span className="capitalize truncate">{t.placeType}</span>
                        <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                          {t._count.placeType}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </SidebarCard>
            )}

            <SidebarCard title="Nearby areas" action={{ label: 'All areas', href: '/' }}>
              <ul className="space-y-3.5">
                {nearby.map((n) => (
                  <li key={n.id}>
                    <Link href={`/area/${n.slug}`} className="group block">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[15px] text-fg group-hover:text-brand-600 transition-colors">
                          {n.name}
                        </span>
                        <span className="shrink-0 text-xs text-fg-subtle">{n._count.places}</span>
                      </span>
                      {n.tagline && (
                        <span className="block mt-0.5 text-xs text-fg-subtle clamp-1">
                          {n.tagline}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </SidebarCard>

            <PhotoSubmitForm subjectName={area.name} areaId={area.id} />

            <NewsletterCard />
          </aside>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-fg-subtle">{label}</dt>
      <dd className="text-right font-medium text-fg">{value}</dd>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border text-sm font-medium capitalize transition-colors ${
        active
          ? 'bg-brand-500 border-brand-500 text-ink-950'
          : 'bg-card border-line text-fg-muted hover:border-brand-500 hover:text-fg'
      }`}
    >
      {children}
    </Link>
  );
}
