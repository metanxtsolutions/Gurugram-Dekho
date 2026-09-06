import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PlaceCard } from '@/components/PlaceCard';
import { SidebarCard } from '@/components/Sidebar';
import { DAY_SHORT, formatMinutes, getOpenState, nowInGurugram, type OpenState } from '@/lib/opening-hours';

export const metadata: Metadata = {
  title: 'What is open in Gurugram right now',
  description:
    'Every place we list that is open at this moment, with when it closes. Checked against real opening hours, in Gurugram time.',
  alternates: { canonical: '/tools/open-now' },
};

/* The answer changes by the minute, so this is never cached. */
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ area?: string }> };

export default async function OpenNowPage({ searchParams }: Props) {
  const { area: areaFilter } = await searchParams;
  const now = new Date();
  const { day, minutes } = nowInGurugram(now);

  const [places, areas] = await Promise.all([
    prisma.place.findMany({
      where: { status: 'published', isActive: true },
      include: { area: { select: { name: true, slug: true } }, image: { select: { url: true } }, openingHours: true },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    }),
    prisma.area.findMany({
      where: { isActive: true, places: { some: { status: 'published', isActive: true } } },
      orderBy: { order: 'asc' },
      select: { name: true, slug: true },
    }),
  ]);

  const withState = places
    .filter((p) => !areaFilter || p.area?.slug === areaFilter)
    .map((p) => ({ place: p, state: getOpenState(p.openingHours, p.alwaysOpen, now) }));

  const open = withState.filter((x) => x.state.status === 'open' || x.state.status === 'always');
  const later = withState.filter((x) => x.state.status === 'closed' && x.state.opensNext?.day === day);
  const closedToday = withState.filter(
    (x) => x.state.status === 'closed' && x.state.opensNext?.day !== day
  );
  const unknown = withState.filter((x) => x.state.status === 'unknown');

  // Closing soonest first, so the one you need to hurry for is at the top.
  open.sort((a, b) => closesIn(a.state) - closesIn(b.state));
  later.sort((a, b) => (a.state.status === 'closed' && b.state.status === 'closed'
    ? (a.state.opensNext?.minutes ?? 0) - (b.state.opensNext?.minutes ?? 0)
    : 0));

  const chip = (slug: string | undefined, label: string) => (
    <Link
      key={slug ?? 'all'}
      href={slug ? `/tools/open-now?area=${slug}` : '/tools/open-now'}
      className={`inline-flex items-center px-4 py-2 rounded-pill border text-sm font-medium transition-colors ${
        (areaFilter ?? undefined) === slug
          ? 'bg-brand-500 border-brand-500 text-ink-950'
          : 'bg-card border-line text-fg-muted hover:border-brand-500 hover:text-fg'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-9">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Tools', href: '/tools' },
              { name: 'Open now', href: '/tools/open-now' },
            ]}
          />
          <h1 className="display mt-6 text-fg text-[2.1rem] md:text-[3rem]">What is open right now</h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
          <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
            It is {DAY_SHORT[day]} {formatMinutes(minutes)} in Gurugram. These are the places we list
            that are open at this moment, soonest to close first, checked against their real hours.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {chip(undefined, 'Everywhere')}
            {areas.map((a) => chip(a.slug, a.name))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <h2 className="display-sm text-fg text-2xl">
                Open now
                <span className="ml-2 text-[14px] font-sans font-medium text-fg-subtle tabular-nums">{open.length}</span>
              </h2>
            </div>

            {open.length === 0 ? (
              <div className="rounded-card border border-dashed border-line bg-card-2 px-6 py-12 text-center">
                <p className="display-sm text-fg text-xl">Nothing we list is open right now</p>
                <p className="mt-2 text-[15px] text-fg-muted">
                  {later.length > 0 ? 'The next openings today are below.' : 'Check back in the morning.'}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {open.map(({ place: p, state }) => (
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
                    openState={state}
                  />
                ))}
              </div>
            )}

            {later.length > 0 && (
              <section className="mt-12">
                <h2 className="display-sm text-fg text-2xl mb-4">
                  Opens later today
                  <span className="ml-2 text-[14px] font-sans font-medium text-fg-subtle tabular-nums">{later.length}</span>
                </h2>
                <ul className="divide-y divide-line rounded-card border border-line bg-card">
                  {later.map(({ place: p, state }) => (
                    <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <Link href={`/place/${p.slug}`} className="min-w-0 font-medium text-fg hover:text-brand-600 transition-colors truncate">
                        {p.name}
                        <span className="ml-2 text-[13px] font-normal text-fg-subtle">{p.area?.name}</span>
                      </Link>
                      <span className="shrink-0 text-[13px] text-fg-muted tabular-nums">
                        {state.status === 'closed' && state.opensNext ? `opens ${formatMinutes(state.opensNext.minutes)}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(closedToday.length > 0 || unknown.length > 0) && (
              <p className="mt-8 text-[13px] text-fg-subtle">
                {closedToday.length > 0 && `${closedToday.length} closed for the rest of today. `}
                {unknown.length > 0 && `${unknown.length} with no hours listed yet. `}
                Seen something wrong? <Link href="/contact" className="text-brand-600 hover:text-brand-700">Tell us</Link> and we fix it that week.
              </p>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SidebarCard title="How this works">
              <p className="text-[14px] text-fg-muted leading-relaxed">
                Every place carries its weekly hours, including the ones that run past midnight.
                The page is worked out fresh on every visit in Gurugram time, so it is right at
                2am on a Sunday as well as noon on a Tuesday.
              </p>
            </SidebarCard>
            <SidebarCard title="Read next">
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/tools/weekend" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Weekend picker
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Hours, budget, car or not: three ideas.</p>
                </li>
                <li>
                  <Link href="/article/sector-29-food-guide-gurugram" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    The Sector 29 food guide
                  </Link>
                </li>
              </ul>
            </SidebarCard>
          </aside>
        </div>
      </div>
    </>
  );
}

/** Minutes until closing, for sorting. Always-open places sort last. */
function closesIn(state: OpenState): number {
  if (state.status === 'open') {
    const { minutes } = nowInGurugram();
    const delta = state.closesAt - minutes;
    return delta < 0 ? delta + 24 * 60 : delta;
  }
  return Number.POSITIVE_INFINITY;
}
