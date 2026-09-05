import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './Icons';

/** Shared furniture for listing pages (category archives, area profiles). */

export function SidebarCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="display-sm text-[19px] text-fg pb-2.5 border-b-2 border-brand-500">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export type PopularItem = {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  featuredImage: { url: string } | null;
};

export function PopularList({ items }: { items: PopularItem[] }) {
  if (items.length === 0) return null;

  return (
    <ol className="space-y-4">
      {items.map((a, i) => (
        <li key={a.id}>
          <Link href={`/article/${a.slug}`} className="group flex gap-3.5 items-start">
            <span className="shrink-0 w-6 pt-0.5 display-sm text-lg text-ink-200 group-hover:text-brand-400 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-[15px] leading-snug text-fg clamp-2 group-hover:text-brand-600 transition-colors">
                {a.title}
              </span>
              <span className="block mt-1 text-xs text-fg-subtle">
                {a.viewCount.toLocaleString('en-IN')} views
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export type CategoryLink = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export function CategoryList({
  items,
  activeSlug,
}: {
  items: CategoryLink[];
  activeSlug?: string;
}) {
  return (
    <ul className="-my-1">
      {items.map((c) => {
        const active = c.slug === activeSlug;
        return (
          <li key={c.id}>
            <Link
              href={`/category/${c.slug}`}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-between gap-3 py-2.5 text-[15px] transition-colors ${
                active
                  ? 'font-bold text-brand-600'
                  : 'font-medium text-fg-muted hover:text-brand-600'
              }`}
            >
              <span className="min-w-0 truncate">{c.name}</span>
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  active ? 'text-brand-500' : 'text-fg-subtle'
                }`}
              >
                {c.count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export type AreaLink = { id: string; name: string; slug: string; places: number };

export function AreaChips({ items }: { items: AreaLink[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((a) => (
        <Link
          key={a.id}
          href={`/area/${a.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-card-2 border border-line text-sm font-medium text-fg-muted hover:border-brand-500 hover:text-brand-600 transition-colors"
        >
          {a.name}
          <span className="text-xs text-fg-subtle">{a.places}</span>
        </Link>
      ))}
    </div>
  );
}

export function NewsletterCard() {
  return (
    /* Marigold card rather than the old dark panel, so it matches the one on
       the homepage and needs no theme-dependent text colours. */
    <section className="rounded-card bg-brand-500 p-5 text-ink-950">
      <h2 className="display-sm text-[21px]">The Friday email</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-950/80">
        What opened, what&apos;s on, what&apos;s worth it. One email every Friday.
      </p>
      <form className="mt-4 space-y-2.5">
        <input
          type="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="w-full px-4 py-2.5 rounded-pill bg-white/70 border border-ink-950/15 text-ink-950 text-sm placeholder:text-ink-950/45 focus:outline-none focus:border-ink-950/40"
        />
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-pill bg-ink-950 hover:bg-ink-800 text-white text-sm font-semibold transition-colors"
        >
          Subscribe
          <Icon name="arrow" className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}

/** Wide lead item that opens an archive list. */
export function FeatureRow({
  href,
  image,
  eyebrow,
  title,
  excerpt,
  meta,
}: {
  href: string;
  image: string | null;
  eyebrow?: string;
  title: string;
  excerpt?: string | null;
  meta: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group grid sm:grid-cols-2 gap-5 sm:gap-7 rounded-card border border-line overflow-hidden bg-card hover:shadow-lift hover:border-transparent transition-all"
    >
      <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[15rem] bg-card-2 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="object-cover zoom-target"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-200 via-brand-50 to-ink-100" />
        )}
      </div>
      <div className="p-5 pt-0 sm:p-6 sm:pl-0 flex flex-col justify-center">
        {eyebrow && <span className="eyebrow text-brand-600">{eyebrow}</span>}
        <h3 className="display-sm mt-2.5 text-fg text-xl sm:text-2xl clamp-3 group-hover:text-brand-600 transition-colors">
          {title}
        </h3>
        {excerpt && <p className="mt-3 text-fg-subtle clamp-3">{excerpt}</p>}
        <div className="mt-4">{meta}</div>
      </div>
    </Link>
  );
}
