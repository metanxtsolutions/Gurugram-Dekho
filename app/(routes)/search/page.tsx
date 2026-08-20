'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleCard } from '@/components/ArticleCard';
import { PlaceCard } from '@/components/PlaceCard';
import { Icon } from '@/components/Icons';
import { QUICK_SEARCHES } from '@/lib/content';

interface SearchResults {
  articles: any[];
  places: any[];
  areas: any[];
}

const EMPTY: SearchResults = { articles: [], places: [], areas: [] };

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchView />
    </Suspense>
  );
}

function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setInput(query), [query]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (query.trim().length < 2) {
        setResults(EMPTY);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=30`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) throw new Error(json.error || 'Search failed');
        setResults({ ...EMPTY, ...json.data });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const total = results.articles.length + results.places.length + results.areas.length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* Search band */}
      <section className="bg-ink-950 relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-24 left-1/3 w-[32rem] h-[32rem] rounded-full bg-brand-500/15 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
          <h1 className="display text-white text-3xl md:text-5xl">
            {query ? <>Results for &ldquo;{query}&rdquo;</> : 'Search Gurugram Dekho'}
          </h1>

          <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="search"
                autoFocus
                placeholder="Search places, guides, sectors…"
                aria-label="Search"
                className="w-full h-14 pr-5 rounded-2xl bg-white text-ink-900 placeholder:text-ink-400 shadow-lift focus:outline-none focus:ring-4 focus:ring-brand-500/30"
                style={{ paddingLeft: '3.25rem' }}
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {!query && (
            <div className="mt-5 flex items-center gap-3">
              <span className="shrink-0 text-sm text-ink-400">Try:</span>
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
          )}

          {query && !loading && !error && (
            <p className="mt-5 text-sm text-ink-400">
              {total} {total === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {loading && <ResultsSkeleton />}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && query && total === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-8 py-16 text-center">
            <h2 className="font-bold text-ink-900 text-lg">
              Nothing matched &ldquo;{query}&rdquo;
            </h2>
            <p className="mt-2 text-ink-500">
              Try a shorter phrase, a sector name, or browse by category instead.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
            >
              Browse categories
            </Link>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-16">
            {results.areas.length > 0 && (
              <Group title="Neighbourhoods" count={results.areas.length}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.areas.map((a) => (
                    <Link
                      key={a.id}
                      href={`/area/${a.slug}`}
                      className="group rounded-2xl border border-ink-100 bg-white p-5 hover:shadow-lift hover:border-transparent transition-all"
                    >
                      <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-100 text-brand-700">
                        <Icon name="pin" />
                      </span>
                      <h3 className="mt-4 font-bold text-ink-950 group-hover:text-brand-600 transition-colors">
                        {a.name}
                      </h3>
                      {a.description && (
                        <p className="mt-1.5 text-sm text-ink-500 clamp-2">{a.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </Group>
            )}

            {results.places.length > 0 && (
              <Group title="Places" count={results.places.length}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.places.map((p) => (
                    <PlaceCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      description={p.description ?? undefined}
                      placeType={p.placeType}
                      area={p.area}
                      image={p.image}
                      rating={p.rating}
                      priceRange={p.priceRange}
                      cuisine={p.cuisine ?? undefined}
                    />
                  ))}
                </div>
              </Group>
            )}

            {results.articles.length > 0 && (
              <Group title="Guides" count={results.articles.length}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.articles.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.id}
                      title={a.title}
                      slug={a.slug}
                      excerpt={a.excerpt ?? undefined}
                      publishedAt={a.publishedAt ? new Date(a.publishedAt) : undefined}
                      author={a.author}
                      featuredImage={a.featuredImage}
                    />
                  ))}
                </div>
              </Group>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-7">
        <h2 className="display-sm text-ink-950 text-2xl">{title}</h2>
        <span className="text-sm font-semibold text-ink-400">{count}</span>
      </div>
      {children}
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] rounded-2xl bg-ink-100" />
          <div className="h-4 mt-4 rounded bg-ink-100 w-3/4" />
          <div className="h-3 mt-2.5 rounded bg-ink-100 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <>
      <div className="bg-ink-950 h-64" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <ResultsSkeleton />
      </div>
    </>
  );
}
