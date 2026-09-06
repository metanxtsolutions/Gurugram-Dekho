import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { getHomepageData } from '@/lib/homepage';
import { EXPLORE_CARDS } from '@/lib/explore';
import { SECTOR_NOTES } from '@/lib/sectors';
import { HomeSearch } from '@/components/HomeSearch';
import { Placeholder } from '@/components/Placeholder';

// Content changes when an editor publishes; revalidate rather than hitting the
// database on every request.
export const revalidate = 300;

/*
  The homepage is built for one reader: someone who just moved here and has a
  question. It leads with the question box and the two tools, then the three
  paths a first month actually follows, then the latest guides, then the areas
  explained in one line each. Every block answers something; nothing is there
  to look big.
*/

const FRONT_DOOR_BLURBS: Record<string, string> = {
  'food-dining': 'Where to eat, and where the second visit happens.',
  'stays-accommodation': 'Renting, PGs, deposits and what to ask.',
  'travel-places': 'Sectors, roads and what each one is like.',
  'business-work': 'Offices, coworking, commutes and day passes.',
};

/*
  Three ordered paths. Article items resolve against whatever is published, so
  a guide that does not exist yet is skipped rather than linked to a 404.
*/
const PATHS: { title: string; blurb: string; items: { slug?: string; href?: string; label: string }[] }[] = [
  {
    title: 'Just landed',
    blurb: 'The first fortnight, in the order it happens.',
    items: [
      { href: '/tools/sector-decoder', label: 'Decode the sector in the listing' },
      { slug: 'moving-to-gurugram-rental-guide', label: 'Read this before you sign a lease' },
      { href: '/tools/move-in-cost', label: 'Work out the cash you need on day one' },
      { slug: 'rapid-metro-gurugram-explained', label: 'The Rapid Metro, explained' },
    ],
  },
  {
    title: 'First weekend',
    blurb: 'Where people go once, and where they go back.',
    items: [
      { slug: 'sector-29-food-guide-gurugram', label: 'The Sector 29 food guide' },
      { slug: 'cyber-hub-vs-cyber-city-2026', label: 'Cyber Hub vs Cyber City' },
      { slug: 'budget-eats-under-300-old-gurgaon', label: 'Budget eats across Old Gurgaon' },
      { slug: 'weekend-escapes-near-gurugram', label: 'Weekend escapes within 90 minutes' },
      { slug: 'fitness-guide-gurugram', label: 'Where to run, swim and train' },
    ],
  },
  {
    title: 'Settling in',
    blurb: 'The questions that arrive in month two.',
    items: [
      { slug: 'gurugram-schools-by-sector-guide', label: 'Schools by sector' },
      { slug: 'best-coworking-spaces-gurugram', label: 'Coworking without a membership' },
      { slug: 'gurugram-saturday-shopping-guide', label: 'Where Gurugram actually shops' },
      { slug: 'cyber-hub-vs-cyber-city-2026', label: 'What changed in Cyber City this year' },
    ],
  },
];

export default async function Home() {
  const { featured, latest, areas, places, categories, stats, usingFallback, slugs } =
    await getHomepageData();
  const published = new Set(slugs);

  // One deduped pool of stories, in editorial order.
  const seen = new Set<string>();
  const pool = [...featured, ...latest].filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
  const [lead, ...rest] = pool;
  const tall = rest[0];
  const rail = rest.slice(1, 5);

  const countFor = (slug: string) => categories.find((c) => c.slug === slug)?.count ?? 0;
  const areaBySlug = new Map(areas.map((a) => [a.slug, a]));

  const paths = PATHS.map((p) => ({
    ...p,
    items: p.items
      .map((it) => {
        if (it.href) return { href: it.href, label: it.label, tool: true };
        return it.slug && published.has(it.slug)
          ? { href: `/article/${it.slug}`, label: it.label, tool: false }
          : null;
      })
      .filter((x): x is { href: string; label: string; tool: boolean } => x !== null),
  })).filter((p) => p.items.length >= 2);

  return (
    <>
      {/* ═══════════════ Hero: the question box ═══════════════ */}
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-10 md:pt-14 md:pb-12">
          {/* Question on the left, the two tools on the right, so a wide screen
              is not half empty and the two ways in sit side by side. */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-14 items-start">
          <div>
          <div className="max-w-3xl">
            <p className="eyebrow text-brand-600">An independent guide to Gurugram and Gurgaon</p>
            <h1 className="display mt-3 text-fg text-[2.4rem] sm:text-[3.2rem] lg:text-[3.6rem]">
              Gurugram, explained by people who live here.
            </h1>
            <p className="mt-4 text-[17px] md:text-lg text-fg-muted leading-relaxed max-w-2xl">
              Renting, sectors, commutes and where to eat, written and checked by residents.
              Nobody pays to be listed.
            </p>
          </div>

          <div className="mt-7 max-w-3xl">
            <HomeSearch align="left" />
          </div>
          </div>

          {/* The two tools, right where the question is being typed */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:pt-2">
            <p className="eyebrow text-fg-subtle sm:col-span-2 lg:col-span-1 -mb-1">Or use a tool</p>
            <ToolLink
              href="/tools/move-in-cost"
              icon="home"
              title="How much cash do I need to move in?"
              blurb="Deposit, brokerage and first month, with your own rent."
            />
            <ToolLink
              href="/tools/sector-decoder"
              icon="map"
              title="What is Sector 29? Or 56, or 24?"
              blurb="The area, the nearest metro, and what it is like."
            />
          </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Four front doors, compact ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {EXPLORE_CARDS.map((door, i) => {
            const countSlug = door.href.replace('/category/', '');
            const count = countFor(countSlug);
            const icons = ['utensils', 'home', 'map', 'briefcase'] as const;
            return (
              <Link
                key={door.slug}
                href={door.href}
                className="group flex items-start gap-3.5 rounded-card border border-line bg-card p-4 hover:border-brand-500 transition-colors"
              >
                <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-brand-500 text-ink-950">
                  <Icon name={icons[i] ?? 'sparkles'} className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span className="display-sm text-[18px] text-fg group-hover:text-brand-600 transition-colors">
                      {door.name}
                    </span>
                    {count > 0 && (
                      <span className="text-[12px] text-fg-subtle tabular-nums">{count} {count === 1 ? 'guide' : 'guides'}</span>
                    )}
                  </span>
                  <span className="block mt-0.5 text-[13.5px] text-fg-muted leading-snug">
                    {FRONT_DOOR_BLURBS[countSlug] ?? ''}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ Start here: three ordered paths ═══════════════ */}
      {paths.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-14 md:pb-20">
          <SectionHead
            title="Start here"
            blurb="Your first month has a shape. These are the pages in the order they become useful."
          />
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {paths.map((p) => (
              <div key={p.title} className="rounded-card border border-line bg-card p-5">
                <h3 className="display-sm text-[21px] text-fg">{p.title}</h3>
                <p className="mt-1 text-[14px] text-fg-muted">{p.blurb}</p>
                <ol className="mt-4 space-y-1">
                  {p.items.map((it, i) => (
                    <li key={it.href} className="flex items-start gap-3 py-2 border-t border-line first:border-t-0">
                      <span className="mt-0.5 grid place-items-center w-6 h-6 shrink-0 rounded-full bg-card-2 border border-line text-[12px] font-semibold text-fg-muted tabular-nums">
                        {i + 1}
                      </span>
                      <Link href={it.href} className="text-[15px] font-medium text-fg hover:text-brand-600 transition-colors leading-snug">
                        {it.label}
                        {it.tool && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-pill bg-brand-500/15 text-brand-700 text-[10.5px] font-semibold uppercase tracking-wide align-middle">
                            tool
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════ Latest guides: the magazine block ═══════════════ */}
      {lead && (
        <section className="bg-card-2 border-y border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
            <SectionHead title="Latest guides" blurb="Every one dated, and checked by someone who went." />
            <div className="grid gap-4 md:gap-5 lg:grid-cols-12">
              {tall && (
                <div className="lg:col-span-3">
                  <PhotoStory story={tall} className="h-full min-h-[300px] lg:min-h-[480px]" />
                </div>
              )}
              <div className="lg:col-span-6">
                <PhotoStory story={lead} large className="h-full min-h-[340px] lg:min-h-[480px]" />
              </div>
              <div className="lg:col-span-3 flex flex-col gap-3">
                {rail.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/article/${s.slug}`}
                    className="group flex items-center gap-3 rounded-card bg-card border border-line p-2.5 hover:border-brand-500 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="eyebrow text-brand-600">{s.category}</p>
                      <h3 className="display-sm text-[15px] text-fg clamp-2 mt-0.5 group-hover:text-brand-600 transition-colors">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-[12px] text-fg-subtle">{s.readMins} min read</p>
                    </div>
                    <div className="relative w-[64px] h-[64px] shrink-0 overflow-hidden rounded-[10px] bg-card-2">
                      {s.image ? (
                        <Image src={s.image} alt="" fill sizes="64px" className="object-cover zoom-target" />
                      ) : (
                        <Placeholder name={s.title} />
                      )}
                    </div>
                  </Link>
                ))}
                <Link
                  href="/category/travel-places"
                  className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-pill border border-line bg-card text-[14px] font-medium text-fg hover:border-brand-500 transition-colors"
                >
                  All guides
                  <Icon name="chevron" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ Know the area: one line each ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <SectionHead
          title="Know the area"
          blurb="Nobody arrives knowing what Sector 29 is. One line, and the nearest metro."
          action={{ href: '/tools/sector-decoder', label: 'Decode any sector' }}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {SECTOR_NOTES.slice(0, 6).map((n) => {
            const a = areaBySlug.get(n.slug);
            return (
              <Link
                key={n.slug}
                href={`/area/${n.slug}`}
                className="group rounded-card border border-line bg-card p-5 hover:border-brand-500 transition-colors"
              >
                <p className="eyebrow text-brand-600">
                  {n.sectors.length === 1 ? `Sector ${n.sectors[0]}` : `Sectors ${n.sectors.join(', ')}`}
                </p>
                <h3 className="display-sm mt-1 text-[21px] text-fg group-hover:text-brand-600 transition-colors">
                  {a?.name ?? n.name}
                </h3>
                <p className="mt-1.5 text-[14.5px] text-fg-muted leading-snug">{n.character}</p>
                <p className="mt-3 flex items-center gap-2 text-[12.5px] text-fg-subtle">
                  <Icon name="navigation" className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span className="truncate">{n.metro.station}</span>
                  <span className="shrink-0 px-1.5 py-0.5 rounded-pill bg-card-2 border border-line text-[10.5px] text-fg-muted">
                    {n.metro.line}
                  </span>
                </p>
                {a && a.places > 0 && (
                  <p className="mt-2 text-[12px] font-medium text-brand-600">
                    {a.places} {a.places === 1 ? 'place' : 'places'} listed
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ Places worth knowing ═══════════════ */}
      {places.length > 0 && (
        <section className="bg-card-2 border-y border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
            <SectionHead
              title="Places worth knowing"
              blurb="Not a ranking. Places someone here would actually send you to."
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {places.slice(0, 4).map((pl) => (
                <Link
                  key={pl.slug}
                  href={`/place/${pl.slug}`}
                  className="group rounded-card border border-line bg-card overflow-hidden hover:border-brand-500 transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-card-2">
                    {/* A photo on a place is a claim it shows that place. The curated
                        fallback images are stock, so they render as the designed
                        placeholder; database images have passed the provenance check. */}
                    {!usingFallback && pl.image ? (
                      <Image src={pl.image} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover zoom-target" />
                    ) : (
                      <Placeholder name={pl.name} label={pl.cuisine} />
                    )}
                    {pl.rating > 0 && (
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-card/95 text-[12px] font-semibold text-fg">
                        <Icon name="star" className="w-3.5 h-3.5 text-brand-500" />
                        {pl.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <h3 className="display-sm text-[16px] text-fg clamp-2 group-hover:text-brand-600 transition-colors">
                      {pl.name}
                    </h3>
                    <p className="mt-1 text-[12.5px] text-fg-subtle truncate">
                      {pl.cuisine} · {pl.priceRange} · {pl.area}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ Why trust this, and the email ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
          <div>
            <SectionHead title="What this is" align="left" />
            <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
              <Principle title="We live here" body="Every guide is written by someone in Gurugram, not assembled from other people's reviews." />
              <Principle title="Nobody pays us" body="No sponsored slots, no paid placement, no affiliate links dressed up as picks." />
              <Principle title="We say when it is bad" body="A place that is not worth it gets said so, which is the whole reason the good ones mean something." />
            </div>
            <p className="mt-5 text-[14px] text-fg-subtle">
              So far: {stats.guides} {stats.guides === 1 ? 'guide' : 'guides'}, {stats.places}{' '}
              {stats.places === 1 ? 'place' : 'places'}, {stats.areas} {stats.areas === 1 ? 'area' : 'areas'}. Small on purpose.
            </p>
          </div>

          <div className="rounded-card bg-brand-500 p-6 text-ink-950">
            <h3 className="display-sm text-[23px]">The Friday email</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-950/80">
              What opened, what is worth doing this weekend, and the occasional warning. One a week.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-pill bg-ink-950 text-white text-[14px] font-medium hover:bg-ink-800 transition-colors"
            >
              Get it weekly
              <Icon name="chevron" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────── small pieces ───────────────────────── */

function SectionHead({
  title,
  blurb,
  align = 'left',
  action,
}: {
  title: string;
  blurb?: string;
  align?: 'center' | 'left';
  action?: { href: string; label: string };
}) {
  return (
    <div className={`mb-6 md:mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 ${align === 'center' ? 'text-center' : ''}`}>
      <div className={align === 'center' ? 'mx-auto' : ''}>
        <h2 className="display text-fg text-[28px] md:text-[36px]">{title}</h2>
        {blurb && <p className="mt-2 text-[15px] text-fg-muted max-w-xl">{blurb}</p>}
        <span className={`block mt-3.5 h-[3px] w-14 rounded-full bg-brand-500 ${align === 'center' ? 'mx-auto' : ''}`} />
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border border-line bg-card text-[14px] font-medium text-fg hover:border-brand-500 transition-colors"
        >
          {action.label}
          <Icon name="chevron" className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ToolLink({ href, icon, title, blurb }: { href: string; icon: string; title: string; blurb: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3.5 rounded-card border border-line bg-card p-4 hover:border-brand-500 transition-colors"
    >
      <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-brand-500 text-ink-950">
        <Icon name={icon} className="w-5 h-5" />
      </span>
      <span className="min-w-0">
        <span className="block display-sm text-[16.5px] text-fg leading-snug group-hover:text-brand-600 transition-colors">
          {title}
        </span>
        <span className="block mt-0.5 text-[13.5px] text-fg-muted">{blurb}</span>
      </span>
    </Link>
  );
}

function PhotoStory({
  story,
  large = false,
  className = '',
}: {
  story: { title: string; slug: string; image: string; category: string; date: string; excerpt: string; readMins: number };
  large?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/article/${story.slug}`}
      className={`group relative isolate block overflow-hidden rounded-card shadow-card hover:shadow-lift transition-shadow bg-card-2 ${className}`}
    >
      {story.image ? (
        <Image
          src={story.image}
          alt=""
          fill
          sizes={large ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 25vw'}
          className="object-cover zoom-target"
          priority={large}
        />
      ) : (
        <Placeholder name={story.title} label={story.category} />
      )}
      <div className="absolute inset-0 photo-scrim" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <span className="inline-block px-2.5 py-1 rounded-pill bg-brand-500 text-ink-950 text-[11px] font-semibold">
          {story.category}
        </span>
        <h3 className={`display-sm text-white mt-3 ${large ? 'text-[24px] md:text-[32px] clamp-3' : 'text-[19px] clamp-3'}`}>
          {story.title}
        </h3>
        {large && (
          <p className="mt-2.5 text-[14px] text-white/80 clamp-2 max-w-xl hidden md:block">{story.excerpt}</p>
        )}
        <p className="mt-2.5 text-[12px] text-white/65">
          {story.date} · {story.readMins} min read
        </p>
      </div>
    </Link>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-5">
      <h3 className="display-sm text-[18px] text-fg">{title}</h3>
      <p className="mt-1.5 text-[14px] text-fg-muted leading-relaxed">{body}</p>
    </div>
  );
}
