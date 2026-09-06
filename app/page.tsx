import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { getHomepageData } from '@/lib/homepage';
import { EXPLORE_CARDS } from '@/lib/explore';
import { noteForSlug } from '@/lib/sectors';
import { HERO_IMAGE } from '@/lib/content';
import { HomeSearch } from '@/components/HomeSearch';
import { Placeholder } from '@/components/Placeholder';

// Content changes when an editor publishes; revalidate rather than hitting the
// database on every request.
export const revalidate = 300;

/*
  A city guide has to have the city in it. Time Out's Delhi front page carries
  about fifty photographs, LBB's about seventy; the previous version of this
  page carried ten and thirty bordered boxes of text. This one leads with a
  photo, and every section after it is photo cards or photo tiles. The text
  sits on the pictures, not beside them in boxes.
*/

const FRONT_DOOR_BLURBS: Record<string, string> = {
  'food-dining': 'Where to eat, and where the second visit happens.',
  'stays-accommodation': 'Renting, PGs, deposits and what to ask.',
  'travel-places': 'Sectors, roads and what each one is like.',
  'business-work': 'Offices, coworking, commutes and day passes.',
};

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
    ],
  },
  {
    title: 'Settling in',
    blurb: 'The questions that arrive in month two.',
    items: [
      { slug: 'gurugram-schools-by-sector-guide', label: 'Schools by sector' },
      { slug: 'best-coworking-spaces-gurugram', label: 'Coworking without a membership' },
      { slug: 'gurugram-saturday-shopping-guide', label: 'Where Gurugram actually shops' },
      { slug: 'fitness-guide-gurugram', label: 'Where to run, swim and train' },
    ],
  },
];

export default async function Home() {
  const { featured, latest, areas, places, categories, stats, usingFallback, slugs } =
    await getHomepageData();
  const published = new Set(slugs);

  const seen = new Set<string>();
  const pool = [...featured, ...latest].filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
  const bySlug = new Map(pool.map((s) => [s.slug, s]));
  const [lead, ...rest] = pool;
  const tall = rest[0];
  const rail = rest.slice(1, 5);

  const countFor = (slug: string) => categories.find((c) => c.slug === slug)?.count ?? 0;

  const paths = PATHS.map((p) => {
    const items = p.items
      .map((it) => {
        if (it.href) return { href: it.href, label: it.label, tool: true };
        return it.slug && published.has(it.slug)
          ? { href: `/article/${it.slug}`, label: it.label, tool: false }
          : null;
      })
      .filter((x): x is { href: string; label: string; tool: boolean } => x !== null);
    // The card's photo is the first guide on the path that we have a picture for.
    const cover = p.items.map((it) => (it.slug ? bySlug.get(it.slug)?.image : undefined)).find(Boolean) ?? '';
    return { ...p, items, cover };
  }).filter((p) => p.items.length >= 2);

  return (
    <>
      {/* ═══════════════ Hero: the city, and the question box on it ═══════════════ */}
      <section className="relative isolate overflow-hidden bg-ink-950 min-h-[560px] md:min-h-[600px] flex items-end">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/15" />
        <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 pb-10 md:pb-14 pt-24">
          <p className="eyebrow text-brand-300">An independent guide to Gurugram and Gurgaon</p>
          <h1 className="display mt-3 text-white text-[2.5rem] sm:text-[3.4rem] lg:text-[4.2rem] max-w-4xl">
            Gurugram, explained by people who live here.
          </h1>
          <p className="mt-4 text-[17px] md:text-lg text-white/80 leading-relaxed max-w-2xl">
            Renting, sectors, commutes and where to eat, written and checked by residents.
            Nobody pays to be listed.
          </p>
          <div className="mt-7 max-w-2xl">
            <HomeSearch align="left" onDark />
          </div>
        </div>
      </section>

      {/* ═══════════════ Quick answers strip ═══════════════ */}
      <section className="bg-brand-500 text-ink-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 -mx-1 px-1">
            <Quick href="/tools/move-in-cost" icon="home" label="How much cash do I need to move in?" />
            <Quick href="/tools/sector-decoder" icon="map" label="What is Sector 29? Or 56, or 24?" />
            <Quick href="/article/moving-to-gurugram-rental-guide" icon="book" label="Read this before you sign a lease" />
            <Quick href="/article/rapid-metro-gurugram-explained" icon="navigation" label="The Rapid Metro, explained" />
          </div>
        </div>
      </section>

      {/* ═══════════════ Explore: four photo doors ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 md:pt-14 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {EXPLORE_CARDS.map((door) => {
            const slug = door.href.replace('/category/', '');
            const count = countFor(slug);
            return (
              <Link
                key={door.slug}
                href={door.href}
                className="group relative isolate overflow-hidden rounded-card aspect-[4/3] lg:aspect-[3/2] shadow-card hover:shadow-lift transition-shadow"
              >
                <Image
                  src={door.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover zoom-target"
                />
                <div className="absolute inset-0 photo-scrim" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <p className="eyebrow text-white/70">Explore</p>
                  <h2 className="display-sm text-white text-[22px] md:text-[26px] mt-0.5">
                    {door.name}
                    {count > 0 && (
                      <span className="ml-2 align-middle text-[12px] font-medium text-white/70">
                        {count} {count === 1 ? 'guide' : 'guides'}
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 text-[13px] text-white/75 leading-snug hidden sm:block">
                    {FRONT_DOOR_BLURBS[slug] ?? ''}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ Latest guides: the magazine block ═══════════════ */}
      {lead && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <SectionHead title="Latest guides" blurb="Every one dated, and checked by someone who went." action={{ href: '/category/travel-places', label: 'All guides' }} />
          <div className="grid gap-3 md:gap-4 lg:grid-cols-12">
            {tall && (
              <div className="lg:col-span-3">
                <PhotoStory story={tall} className="h-full min-h-[300px] lg:min-h-[500px]" />
              </div>
            )}
            <div className="lg:col-span-6">
              <PhotoStory story={lead} large className="h-full min-h-[360px] lg:min-h-[500px]" />
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
              {rail.map((s) => (
                <PhotoStory key={s.slug} story={s} small className="min-h-[150px] lg:min-h-0 lg:h-full" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ Start here: three paths, each with a picture ═══════════════ */}
      {paths.length > 0 && (
        <section className="bg-card-2 border-y border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
            <SectionHead
              title="Start here"
              blurb="Your first month has a shape. These are the pages in the order they become useful."
            />
            <div className="grid md:grid-cols-3 gap-3 md:gap-4">
              {paths.map((p) => (
                <div key={p.title} className="rounded-card overflow-hidden bg-card shadow-card">
                  <div className="relative aspect-[16/9] bg-ink-950">
                    {p.cover ? (
                      <Image src={p.cover} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <Placeholder name={p.title} />
                    )}
                    <div className="absolute inset-0 photo-scrim" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="display-sm text-white text-[22px]">{p.title}</h3>
                      <p className="text-[13px] text-white/75">{p.blurb}</p>
                    </div>
                  </div>
                  <ol className="p-4 pt-2">
                    {p.items.map((it, i) => (
                      <li key={it.href} className="flex items-start gap-3 py-2.5 border-b border-line last:border-b-0">
                        <span className="mt-0.5 grid place-items-center w-6 h-6 shrink-0 rounded-full bg-brand-500 text-ink-950 text-[12px] font-bold tabular-nums">
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
          </div>
        </section>
      )}

      {/* ═══════════════ Neighbourhoods: photo tiles ═══════════════ */}
      {areas.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <SectionHead
            title="Know the neighbourhoods"
            blurb="Nobody arrives knowing what Sector 29 is. One line each, and the nearest metro."
            action={{ href: '/tools/sector-decoder', label: 'Decode any sector' }}
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {areas.slice(0, 6).map((a) => {
              const n = noteForSlug(a.slug);
              return (
                <Link
                  key={a.slug}
                  href={`/area/${a.slug}`}
                  className="group relative isolate overflow-hidden rounded-card aspect-[4/3] lg:aspect-[16/10] shadow-card hover:shadow-lift transition-shadow"
                >
                  {/* A photo on an area is a claim it shows that area. The curated
                      fallback images are stock, so they render as the placeholder;
                      database images have been through the provenance check. */}
                  {!usingFallback && a.image ? (
                    <Image src={a.image} alt="" fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover zoom-target" />
                  ) : (
                    <Placeholder name={a.name} />
                  )}
                  <div className="absolute inset-0 photo-scrim" />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    {n && (
                      <p className="eyebrow text-brand-300">
                        {n.sectors.length === 1 ? `Sector ${n.sectors[0]}` : `Sectors ${n.sectors.join(', ')}`}
                      </p>
                    )}
                    <h3 className="display-sm text-white text-[21px] md:text-[24px] mt-0.5">{a.name}</h3>
                    <p className="mt-1 text-[13px] text-white/80 leading-snug clamp-2">
                      {n?.character ?? a.tagline}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-white/70">
                      {n && (
                        <>
                          <Icon name="navigation" className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                          <span className="truncate">{n.metro.station}</span>
                        </>
                      )}
                      {a.places > 0 && (
                        <span className="ml-auto shrink-0 px-2 py-0.5 rounded-pill bg-white/15 border border-white/25">
                          {a.places} {a.places === 1 ? 'place' : 'places'}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════ Places worth knowing ═══════════════ */}
      {places.length > 0 && (
        <section className="bg-card-2 border-y border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
            <SectionHead title="Places worth knowing" blurb="Not a ranking. Places someone here would actually send you to." />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {places.slice(0, 4).map((pl) => (
                <Link
                  key={pl.slug}
                  href={`/place/${pl.slug}`}
                  className="group relative isolate overflow-hidden rounded-card aspect-[4/5] sm:aspect-[3/4] shadow-card hover:shadow-lift transition-shadow"
                >
                  {!usingFallback && pl.image ? (
                    <Image src={pl.image} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover zoom-target" />
                  ) : (
                    <Placeholder name={pl.name} label={pl.cuisine} />
                  )}
                  <div className="absolute inset-0 photo-scrim" />
                  {pl.rating > 0 && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-white/95 text-[12px] font-semibold text-ink-950">
                      <Icon name="star" className="w-3.5 h-3.5 text-brand-500" />
                      {pl.rating.toFixed(1)}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="display-sm text-white text-[18px] md:text-[20px] clamp-2">{pl.name}</h3>
                    <p className="mt-1 text-[12.5px] text-white/75 truncate">
                      {pl.cuisine} · {pl.priceRange} · {pl.area}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ The promise, on the marigold ═══════════════ */}
      <section className="bg-brand-500 text-ink-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-14 items-start">
            <div>
              <p className="eyebrow text-ink-950/60">What this is</p>
              <h2 className="display mt-2 text-[28px] md:text-[36px]">Nobody pays to be on this page.</h2>
              <div className="mt-6 grid sm:grid-cols-3 gap-6">
                <Principle title="We live here" body="Every guide is written by someone in Gurugram, not assembled from other people's reviews." />
                <Principle title="Nobody pays us" body="No sponsored slots, no paid placement, no affiliate links dressed up as picks." />
                <Principle title="We say when it is bad" body="A place that is not worth it gets said so, which is the whole reason the good ones mean something." />
              </div>
              <p className="mt-6 text-[14px] text-ink-950/70">
                So far: {stats.guides} {stats.guides === 1 ? 'guide' : 'guides'}, {stats.places}{' '}
                {stats.places === 1 ? 'place' : 'places'}, {stats.areas} {stats.areas === 1 ? 'area' : 'areas'}. Small on purpose.
              </p>
            </div>

            <div className="rounded-card bg-ink-950 text-white p-6">
              <h3 className="display-sm text-[23px]">The Friday email</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                What opened, what is worth doing this weekend, and the occasional warning. One a week.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-pill bg-brand-500 text-ink-950 text-[14px] font-semibold hover:bg-brand-400 transition-colors"
              >
                Get it weekly
                <Icon name="chevron" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────── small pieces ───────────────────────── */

function Quick({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-ink-950/10 hover:bg-ink-950 hover:text-white text-[14px] font-medium transition-colors whitespace-nowrap"
    >
      <Icon name={icon} className="w-4 h-4" />
      {label}
    </Link>
  );
}

function SectionHead({
  title,
  blurb,
  action,
}: {
  title: string;
  blurb?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 md:mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h2 className="display text-fg text-[28px] md:text-[36px]">{title}</h2>
        {blurb && <p className="mt-2 text-[15px] text-fg-muted max-w-xl">{blurb}</p>}
        <span className="block mt-3.5 h-[3px] w-14 rounded-full bg-brand-500" />
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

function PhotoStory({
  story,
  large = false,
  small = false,
  className = '',
}: {
  story: { title: string; slug: string; image: string; category: string; date: string; excerpt: string; readMins: number };
  large?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/article/${story.slug}`}
      className={`group relative isolate block overflow-hidden rounded-card shadow-card hover:shadow-lift transition-shadow bg-ink-950 ${className}`}
    >
      {story.image ? (
        <Image
          src={story.image}
          alt=""
          fill
          sizes={large ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'}
          className="object-cover zoom-target"
          priority={large}
        />
      ) : (
        <Placeholder name={story.title} label={story.category} />
      )}
      <div className="absolute inset-0 photo-scrim" />
      <div className={`absolute inset-x-0 bottom-0 ${small ? 'p-3' : 'p-4 md:p-6'}`}>
        <span className={`inline-block rounded-pill bg-brand-500 text-ink-950 font-semibold ${small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
          {story.category}
        </span>
        <h3
          className={`display-sm text-white ${
            large ? 'mt-3 text-[24px] md:text-[32px] clamp-3' : small ? 'mt-2 text-[15px] clamp-2' : 'mt-3 text-[19px] clamp-3'
          }`}
        >
          {story.title}
        </h3>
        {large && (
          <p className="mt-2.5 text-[14px] text-white/80 clamp-2 max-w-xl hidden md:block">{story.excerpt}</p>
        )}
        {!small && (
          <p className="mt-2.5 text-[12px] text-white/65">
            {story.date} · {story.readMins} min read
          </p>
        )}
      </div>
    </Link>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t-2 border-ink-950/30 pt-3">
      <h3 className="display-sm text-[18px]">{title}</h3>
      <p className="mt-1.5 text-[14px] text-ink-950/75 leading-relaxed">{body}</p>
    </div>
  );
}
