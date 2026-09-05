import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { getHomepageData } from '@/lib/homepage';
import { EXPLORE_CARDS } from '@/lib/explore';
import { HomeSearch } from '@/components/HomeSearch';
import { Placeholder } from '@/components/Placeholder';

// Content changes when an editor publishes; revalidate rather than hitting the
// database on every request.
export const revalidate = 300;

export default async function Home() {
  const { featured, latest, areas, places, categories, stats, usingFallback } =
    await getHomepageData();

  /*
    One deduped pool, allocated in order. The first build sliced `latest` into
    four disjoint buckets, which assumed roughly twenty stories: the site has
    eight, so three of the four sections rendered empty and the main column
    collapsed to a blank strip beside the sidebar. Everything below takes from
    the same pool and each section only renders once it has something.
  */
  const seen = new Set<string>();
  const pool = [...featured, ...latest].filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });

  const [lead, ...restPool] = pool;
  const tall = restPool[0];
  const railStories = restPool.slice(1, 5);
  const moreGuides = restPool.slice(5);

  return (
    <>
      {/* ═══════════════ Hero ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-6 md:pt-16 md:pb-10 text-center">
        <h1 className="display text-fg text-[2.6rem] sm:text-6xl lg:text-[4.5rem] max-w-4xl mx-auto">
          Explore the <span className="text-brand-500">Millennium City</span>!
        </h1>
        <p className="mt-5 text-[17px] md:text-lg text-fg-muted max-w-2xl mx-auto leading-relaxed">
          Honest guides to food, neighbourhoods, rentals and work in Gurugram,
          written by people who actually live here. Nobody pays to be listed.
        </p>

        <HomeSearch className="mt-8" />
      </section>

      {/* ═══════════════ The four Explore cards ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-14 md:pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {EXPLORE_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className="group relative isolate overflow-hidden rounded-card aspect-[3/4] sm:aspect-[4/5] shadow-card hover:shadow-lift transition-shadow"
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover zoom-target"
              />
              <div className="absolute inset-0 photo-scrim" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-center">
                <p className="eyebrow text-white/75">Explore</p>
                <h2 className="display-sm text-white text-[22px] md:text-[27px] mt-1">
                  {card.name}
                </h2>
                <span className="inline-block mt-3 px-4 py-2 rounded-pill bg-white/12 backdrop-blur-sm border border-white/25 text-white text-[13px] font-medium group-hover:bg-brand-500 group-hover:border-brand-500 group-hover:text-ink-950 transition-colors">
                  {card.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ Blog feed: the magazine block ═══════════════ */}
      {lead && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-14 md:pb-20">
          <SectionHead title="Explore Our Blog Feed" />

          <div className="grid gap-4 md:gap-5 lg:grid-cols-12">
            {/* Tall card, left */}
            {tall && (
              <div className="lg:col-span-3">
                <PhotoStory story={tall} className="h-full min-h-[320px] lg:min-h-[520px]" />
              </div>
            )}

            {/* The lead, centre */}
            <div className="lg:col-span-6">
              <PhotoStory story={lead} large className="h-full min-h-[360px] lg:min-h-[520px]" />
            </div>

            {/* Thumbnail rail, right */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              {railStories.map((s) => (
                <Link
                  key={s.slug}
                  href={`/article/${s.slug}`}
                  className="group flex items-center gap-3 rounded-card bg-card border border-line p-2.5 hover:border-brand-300 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="display-sm text-[15px] text-fg clamp-3 group-hover:text-brand-600 transition-colors">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-[12px] text-fg-subtle">{s.date}</p>
                  </div>
                  <div className="relative w-[68px] h-[68px] shrink-0 overflow-hidden rounded-[10px]">
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="68px"
                      className="object-cover zoom-target"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ Areas ═══════════════ */}
      {areas.length > 0 && (
        <section className="bg-card-2 border-y border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
            <SectionHead
              title="Read the city"
              blurb="Nobody arrives knowing what Sector 29 is. Here is the shortest version."
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {areas.slice(0, 6).map((a) => (
                <AreaTile key={a.slug} area={a} photo={!usingFallback} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ More guides + sidebar ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        {/*
          The two-column layout is only used when there are guides to put in the
          left column. With none, the sidebar blocks lay out across the full
          width instead of leaving a blank strip beside them.
        */}
        <div
          className={
            moreGuides.length > 0
              ? 'grid gap-10 lg:gap-12 lg:grid-cols-[1fr_320px]'
              : ''
          }
        >
          {moreGuides.length > 0 && (
            <div>
              <SectionHead title="More guides" align="left" />
              <div className="grid sm:grid-cols-2 gap-4">
                {moreGuides.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/article/${s.slug}`}
                    className="group rounded-card bg-card border border-line overflow-hidden hover:shadow-card transition-shadow"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 340px"
                        className="object-cover zoom-target"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-pill bg-brand-500 text-ink-950 text-[11px] font-semibold">
                        {s.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="display-sm text-[17px] text-fg clamp-2 group-hover:text-brand-600 transition-colors">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-[13px] text-fg-muted clamp-2">{s.excerpt}</p>
                      <p className="mt-2.5 text-[12px] text-fg-subtle">
                        {s.date} · {s.readMins} min read
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <aside
            className={
              moreGuides.length > 0
                ? 'space-y-8'
                : 'grid gap-5 md:grid-cols-2 lg:grid-cols-4 items-start'
            }
          >
            <SidebarBlock title="Categories">
              <div className="space-y-1">
                {categories.slice(0, 8).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="flex items-center justify-between py-2.5 border-b border-line text-[15px] font-medium text-fg hover:text-brand-600 transition-colors"
                  >
                    {c.name}
                    <span className="text-[13px] text-fg-subtle tabular-nums">{c.count}</span>
                  </Link>
                ))}
              </div>
            </SidebarBlock>

            {places.length > 0 && (
              <SidebarBlock title="Places worth knowing">
                <div className="space-y-3">
                  {places.slice(0, 4).map((pl) => (
                    <Link
                      key={pl.slug}
                      href={`/place/${pl.slug}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-[10px]">
                        {usingFallback ? (
                          <Placeholder name={pl.name} />
                        ) : (
                          <Image src={pl.image} alt="" fill sizes="48px" className="object-cover zoom-target" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-fg truncate group-hover:text-brand-600 transition-colors">
                          {pl.name}
                        </p>
                        <p className="text-[12px] text-fg-subtle truncate">
                          {pl.area} · {pl.priceRange}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </SidebarBlock>
            )}

            <SidebarBlock title="So far">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat value={stats.guides} label="Guides" />
                <Stat value={stats.places} label="Places" />
                <Stat value={stats.areas} label="Areas" />
              </div>
              <p className="mt-4 text-[13px] text-fg-muted leading-relaxed">
                Small on purpose. Every one written, checked, and worth your time.
              </p>
            </SidebarBlock>

            <div className="rounded-card bg-brand-500 p-5 text-ink-950">
              <h3 className="display-sm text-[21px]">The Friday email</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-950/80">
                New openings, what is worth doing this weekend, and the occasional
                warning.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 rounded-pill bg-ink-950 text-white text-[14px] font-medium hover:bg-ink-800 transition-colors"
              >
                Get it weekly
                <Icon name="chevron" className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

    </>
  );
}

/* ───────────────────────── small pieces ───────────────────────── */

function SectionHead({
  title,
  blurb,
  align = 'center',
}: {
  title: string;
  blurb?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`mb-6 md:mb-8 ${align === 'center' ? 'text-center' : ''}`}>
      <h2 className="display text-fg text-[28px] md:text-[38px]">{title}</h2>
      {blurb && (
        <p
          className={`mt-2.5 text-[15px] text-fg-muted ${
            align === 'center' ? 'max-w-xl mx-auto' : 'max-w-xl'
          }`}
        >
          {blurb}
        </p>
      )}
      <span
        className={`block mt-4 h-[3px] w-14 rounded-full bg-brand-500 ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      />
    </div>
  );
}

function PhotoStory({
  story,
  large = false,
  className = '',
}: {
  story: { title: string; slug: string; image: string; category: string; date: string; excerpt: string };
  large?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/article/${story.slug}`}
      className={`group relative isolate block overflow-hidden rounded-card shadow-card hover:shadow-lift transition-shadow ${className}`}
    >
      <Image
        src={story.image}
        alt=""
        fill
        sizes={large ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 25vw'}
        className="object-cover zoom-target"
        priority={large}
      />
      <div className="absolute inset-0 photo-scrim" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <span className="inline-block px-2.5 py-1 rounded-pill bg-brand-500 text-ink-950 text-[11px] font-semibold">
          {story.category}
        </span>
        <h3
          className={`display-sm text-white mt-3 ${
            large ? 'text-[24px] md:text-[34px] clamp-3' : 'text-[19px] clamp-3'
          }`}
        >
          {story.title}
        </h3>
        {large && (
          <p className="mt-2.5 text-[14px] text-white/80 clamp-2 max-w-xl hidden md:block">
            {story.excerpt}
          </p>
        )}
        <p className="mt-2.5 text-[12px] text-white/65">{story.date}</p>
      </div>
    </Link>
  );
}

/*
  Two states, on purpose.

  With a real photograph (one that came from the database and passed the
  provenance check) the tile is a photo card. Without one it is a designed tile
  rather than a photo frame holding a "no image" notice: six of those on the
  homepage read as an unfinished site, when the honest position is simply that
  the guides are written and the photography follows.
*/
function AreaTile({
  area,
  photo,
}: {
  area: { name: string; slug: string; tagline: string; image: string; places: number };
  photo: boolean;
}) {
  const initials = area.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!photo) {
    /* Sized to its content rather than to a photo's 16:10 box, which otherwise
       leaves most of the card empty. */
    return (
      <Link
        href={`/area/${area.slug}`}
        className="group relative isolate overflow-hidden rounded-card bg-card border border-line p-5 hover:border-brand-500 transition-colors"
      >
        <span
          aria-hidden="true"
          className="absolute right-3 top-1/2 -translate-y-1/2 display text-[4.5rem] leading-none text-brand-500/12 select-none"
        >
          {initials}
        </span>
        <div className="relative pr-16">
          <h3 className="display-sm text-[20px] md:text-[23px] text-fg group-hover:text-brand-600 transition-colors">
            {area.name}
          </h3>
          <p className="mt-1 text-[13px] text-fg-muted clamp-2">{area.tagline}</p>
          <p className="mt-2.5 text-[12px] font-medium text-brand-600">
            {area.places} {area.places === 1 ? 'place' : 'places'}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/area/${area.slug}`}
      className="group relative isolate overflow-hidden rounded-card aspect-[16/10] shadow-card hover:shadow-lift transition-shadow"
    >
      <Image
        src={area.image}
        alt=""
        fill
        sizes="(max-width: 1024px) 50vw, 33vw"
        className="object-cover zoom-target"
      />
      <div className="absolute inset-0 photo-scrim" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3 className="display-sm text-[20px] md:text-[23px] text-white">{area.name}</h3>
        <p className="mt-1 text-[13px] text-white/75 clamp-2">{area.tagline}</p>
        <p className="mt-2 text-[12px] font-medium text-brand-300">
          {area.places} {area.places === 1 ? 'place' : 'places'}
        </p>
      </div>
    </Link>
  );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-card border border-line p-5">
      <h3 className="display-sm text-[19px] text-fg pb-3 mb-1 border-b-2 border-brand-500 inline-block">
        {title}
      </h3>
      <div className="pt-3">{children}</div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[10px] bg-card-2 py-3">
      <p className="display text-[24px] text-brand-600 tabular-nums">{value}</p>
      <p className="text-[11px] text-fg-subtle mt-0.5">{label}</p>
    </div>
  );
}
