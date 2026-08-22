import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { HERO_IMAGE, QUICK_SEARCHES } from '@/lib/content';
import { getHomepageData } from '@/lib/homepage';

// Content changes when an editor publishes; revalidate rather than hitting the
// database on every request.
export const revalidate = 300;

export default async function Home() {
  const { featured, latest, areas, places, categories, stats } = await getHomepageData();
  const [lead, ...rest] = featured;

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink-950">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.28]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-950/85 to-brand-900/50" />
        <div className="absolute inset-0 bg-grid opacity-[0.35]" />
        {/* warm glow behind the headline */}
        <div className="absolute -top-32 left-1/4 w-[42rem] h-[42rem] rounded-full bg-brand-500/20 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="max-w-3xl">
            <p className="eyebrow text-brand-300 mb-5">
              Gurugram · Gurgaon · Millennium City
            </p>
            <h1 className="display text-white text-[2.6rem] sm:text-6xl lg:text-[4.25rem]">
              Everything worth knowing about{' '}
              <span className="text-brand-400">Gurugram</span>.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-200 max-w-2xl leading-relaxed">
              Honest guides to food, neighbourhoods, rentals and work, written
              by people who actually live here. No paid listings, no filler.
            </p>

            {/* Search */}
            <form
              action="/search"
              className="mt-9 flex flex-col sm:flex-row gap-3 max-w-2xl"
            >
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  name="q"
                  type="search"
                  required
                  minLength={2}
                  placeholder="Try “rooftop in Sector 29” or “PG near Cyber City”"
                  aria-label="Search Gurugram Dekho"
                  className="w-full h-14 pl-13 pr-5 rounded-2xl bg-white text-ink-900 text-[15px] placeholder:text-ink-400 shadow-lift focus:outline-none focus:ring-4 focus:ring-brand-500/30"
                  style={{ paddingLeft: '3.25rem' }}
                />
              </div>
              <button
                type="submit"
                className="h-14 px-8 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[15px] transition-colors shadow-lift"
              >
                Search
              </button>
            </form>

            {/* Quick searches: a single scrolling rail rather than a wrapping
                block, so the hero keeps a fixed height as terms are added. */}
            <div className="mt-5 flex items-center gap-3">
              <span className="shrink-0 text-sm text-ink-400">Popular:</span>
              <div
                className="min-w-0 flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1 -my-1"
                role="list"
              >
                {QUICK_SEARCHES.map((q) => (
                  <Link
                    key={q}
                    role="listitem"
                    href={`/search?q=${encodeURIComponent(q)}`}
                    className="shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-sm text-ink-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {q}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <dl className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/10 border border-white/10">
            {[
              [stats.places.toLocaleString('en-IN'), 'Places listed'],
              [stats.areas.toLocaleString('en-IN'), 'Areas covered'],
              [stats.guides.toLocaleString('en-IN'), 'Guides published'],
              ['Weekly', 'Updates'],
            ].map(([value, label]) => (
              <div key={label} className="bg-ink-950/60 px-6 py-5 backdrop-blur-sm">
                <dt className="display-sm text-2xl md:text-3xl text-white">{value}</dt>
                <dd className="mt-1 text-sm text-ink-400">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ──────────────────── Featured stories ──────────────────── */}
      {lead && (
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <SectionHead
          eyebrow="This week"
          title="What's hot in Gurugram"
          href="/category/food-dining"
          linkLabel="All stories"
        />

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Lead story */}
          <Link
            href={`/article/${lead.slug}`}
            className="group lg:col-span-7 relative rounded-3xl overflow-hidden bg-ink-950 shadow-card hover:shadow-lift transition-shadow"
          >
            <div className="relative aspect-[16/11] sm:aspect-[16/10]">
              <CardImage
                src={lead.image}
                alt={lead.title}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover zoom-target"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold tracking-wide">
                {lead.category}
              </span>
              <h3 className="display-sm mt-4 text-white text-2xl sm:text-[2rem] clamp-3">
                {lead.title}
              </h3>
              <p className="mt-3 text-ink-200 clamp-2 max-w-xl">{lead.excerpt}</p>
              <Meta
                className="mt-5 text-ink-300"
                author={lead.author}
                date={lead.date}
                readMins={lead.readMins}
              />
            </div>
          </Link>

          {/* Secondary stories */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {rest.map((s) => (
              <Link
                key={s.slug}
                href={`/article/${s.slug}`}
                className="group flex gap-4 sm:gap-5 rounded-2xl p-3 -m-3 hover:bg-ink-50 transition-colors"
              >
                <div className="relative w-28 sm:w-36 aspect-square shrink-0 rounded-xl overflow-hidden bg-ink-100">
                  <CardImage
                    src={s.image}
                    alt={s.title}
                    sizes="144px"
                    className="object-cover zoom-target"
                  />
                </div>
                <div className="min-w-0 py-0.5">
                  <span className="eyebrow text-brand-600">{s.category}</span>
                  <h3 className="mt-2 font-bold text-ink-950 text-[17px] leading-snug clamp-2 group-hover:text-brand-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-500 clamp-2 hidden sm:block">
                    {s.excerpt}
                  </p>
                  <Meta className="mt-2.5 text-ink-400" date={s.date} readMins={s.readMins} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ────────────────────── Categories ────────────────────── */}
      <section className="bg-ink-50/70 border-y border-ink-100">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <SectionHead eyebrow="Browse" title="Explore by category" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group relative rounded-2xl bg-white border border-ink-100 p-5 sm:p-6 hover:border-transparent hover:shadow-lift transition-all hover:-translate-y-0.5"
              >
                <span
                  className={`grid place-items-center w-11 h-11 rounded-xl ${c.tone}`}
                >
                  <Icon name={c.icon} className="w-[22px] h-[22px]" />
                </span>
                <h3 className="mt-4 font-bold text-ink-950 group-hover:text-brand-600 transition-colors">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-ink-500 clamp-2">{c.blurb}</p>
                <p className="mt-3 text-xs font-semibold text-ink-400">
                  {c.count} guides
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────  Areas ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <SectionHead
          eyebrow="Neighbourhoods"
          title="Where in Gurugram?"
          description="Every sector has its own personality. Start with the ones people ask about most."
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {areas.map((a) => (
            <Link
              key={a.slug}
              href={`/area/${a.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/2] bg-ink-900 shadow-card hover:shadow-lift transition-shadow"
            >
              <CardImage
                src={a.image}
                alt={a.name}
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-80 zoom-target"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-bold text-white text-lg sm:text-xl">{a.name}</h3>
                <p className="text-sm text-ink-300 mt-0.5">{a.tagline}</p>
                <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                  <Icon name="pin" className="w-3.5 h-3.5" />
                  {a.places} places
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────── Places ─────────────────────── */}
      <section className="bg-ink-50/70 border-y border-ink-100">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <SectionHead
            eyebrow="Editors' picks"
            title="Places worth your evening"
            href="/category/food-dining"
            linkLabel="All places"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {places.map((p) => (
              <Link
                key={p.slug}
                href={`/place/${p.slug}`}
                className="group rounded-2xl overflow-hidden bg-white border border-ink-100 hover:shadow-lift hover:border-transparent transition-all"
              >
                <div className="relative aspect-[4/3] bg-ink-100 overflow-hidden">
                  <CardImage
                    src={p.image}
                    alt={p.name}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover zoom-target"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur text-xs font-bold text-ink-900 shadow-sm">
                    <Icon name="star" className="w-3.5 h-3.5 text-brand-500" />
                    {p.rating.toFixed(1)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-ink-950 clamp-2 group-hover:text-brand-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-500">{p.cuisine}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-ink-500">
                      <Icon name="pin" className="w-3.5 h-3.5" />
                      {p.area}
                    </span>
                    <span className="font-semibold text-ink-700">{p.priceRange}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── Latest ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <SectionHead eyebrow="Fresh" title="Latest guides" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {latest.map((s) => (
            <Link key={s.slug} href={`/article/${s.slug}`} className="group">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-ink-100">
                <CardImage
                  src={s.image}
                  alt={s.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover zoom-target"
                />
              </div>
              <span className="eyebrow block mt-4 text-brand-600">{s.category}</span>
              <h3 className="mt-2 font-bold text-ink-950 text-[17px] leading-snug clamp-2 group-hover:text-brand-600 transition-colors">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-ink-500 clamp-2">{s.excerpt}</p>
              <Meta className="mt-3 text-ink-400" date={s.date} readMins={s.readMins} />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────────────── Newsletter ───────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative isolate overflow-hidden rounded-3xl bg-ink-950 px-6 py-14 sm:px-14 sm:py-16">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-brand-500/25 blur-[100px]" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-brand-300">Newsletter</p>
            <h2 className="display-sm mt-3 text-white text-3xl sm:text-4xl">
              One email a week. Only what's actually new in Gurugram.
            </h2>
            <p className="mt-4 text-ink-300">
              New openings, event picks and neighbourhood guides. Unsubscribe any
              time. We don't sell your address.
            </p>
            <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="flex-1 h-13 px-5 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500/50"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── helpers ─────────────────────────────────────────────── */

/**
 * next/image throws on an empty src, and records created through the admin
 * panel may not have an image yet, fall back to a brand gradient.
 */
function CardImage({
  src,
  alt,
  sizes,
  className = '',
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-brand-200 via-brand-50 to-ink-100"
      />
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
}

function SectionHead({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8 md:mb-10">
      <div className="max-w-2xl">
        <p className="eyebrow text-brand-600">{eyebrow}</p>
        <h2 className="display-sm mt-2.5 text-ink-950 text-[1.75rem] sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-ink-500 leading-relaxed">{description}</p>
        )}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-ink-700 hover:text-brand-600 transition-colors"
        >
          {linkLabel}
          <Icon name="arrow" className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function Meta({
  author,
  date,
  readMins,
  className = '',
}: {
  author?: string;
  date: string;
  readMins: number;
  className?: string;
}) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs ${className}`}>
      {author && (
        <>
          <span className="font-semibold">{author}</span>
          <span aria-hidden="true">·</span>
        </>
      )}
      <span>{date}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <Icon name="clock" className="w-3.5 h-3.5" />
        {readMins} min read
      </span>
    </p>
  );
}
