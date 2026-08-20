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
    <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="eyebrow text-ink-400">{title}</h2>
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
              <span className="block font-semibold text-[15px] leading-snug text-ink-900 clamp-2 group-hover:text-brand-600 transition-colors">
                {a.title}
              </span>
              <span className="block mt-1 text-xs text-ink-400">
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
                  : 'font-medium text-ink-700 hover:text-brand-600'
              }`}
            >
              <span className="min-w-0 truncate">{c.name}</span>
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  active ? 'text-brand-500' : 'text-ink-300'
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-50 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
        >
          {a.name}
          <span className="text-xs text-ink-400">{a.places}</span>
        </Link>
      ))}
    </div>
  );
}

export function NewsletterCard() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-ink-950 p-6">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-500/25 blur-[70px]" />
      <div className="relative">
        <h2 className="eyebrow text-brand-300">Weekly digest</h2>
        <p className="mt-3 font-bold text-white leading-snug">
          What opened, what&apos;s on, what&apos;s worth it.
        </p>
        <p className="mt-2 text-sm text-ink-400">One email every Friday.</p>
        <form className="mt-5 space-y-2.5">
          <input
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email address"
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-500/60"
          />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
          >
            Subscribe
            <Icon name="arrow" className="w-4 h-4" />
          </button>
        </form>
      </div>
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
      className="group grid sm:grid-cols-2 gap-5 sm:gap-7 rounded-2xl border border-ink-100 overflow-hidden bg-white hover:shadow-lift hover:border-transparent transition-all"
    >
      <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[15rem] bg-ink-100 overflow-hidden">
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
        <h3 className="display-sm mt-2.5 text-ink-950 text-xl sm:text-2xl clamp-3 group-hover:text-brand-600 transition-colors">
          {title}
        </h3>
        {excerpt && <p className="mt-3 text-ink-500 clamp-3">{excerpt}</p>}
        <div className="mt-4">{meta}</div>
      </div>
    </Link>
  );
}
