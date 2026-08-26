'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleCard } from '@/components/ArticleCard';
import { PlaceCard } from '@/components/PlaceCard';
import { Icon } from '@/components/Icons';
import { QUICK_SEARCHES } from '@/lib/content';

/*
  Shapes mirror what /api/search returns. Previously `any[]`, which meant a
  change to the API payload would surface as a runtime error in the card
  components rather than a type error here.
*/
type SearchArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  viewCount?: number;
  author?: { name: string } | null;
  featuredImage?: { url: string } | null;
  categories?: { category: { name: string; slug: string } }[];
};

type SearchPlace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  placeType: string;
  rating: number;
  priceRange: string;
  cuisine: string | null;
  area?: { name: string; slug: string } | null;
  image?: { url: string } | null;
};

type SearchArea = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

interface SearchResults {
  articles: SearchArticle[];
  places: SearchPlace[];
  areas: SearchArea[];
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

  /*
    Resync the field when the URL query changes, e.g. on a back navigation or a
    click on one of the suggestion chips. Adjusting state during render is
    React's documented pattern for this; doing it in an effect caused a second
    render pass on every navigation.
  */
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setInput(query);
  }

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
      {/* Light band, matching the category header. The dark panel here was the
          last survivor of the previous visual direction. */}
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
          <h1 className="display text-fg text-[2rem] md:text-[3rem]">
            {query ? <>Results for &ldquo;{query}&rdquo;</> : 'Search Gurugram Dekho'}
          </h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />

          <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-fg-subtle"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="search"
                autoFocus
                placeholder="Search places, guides, sectors…"
                aria-label="Search"
                className="w-full h-14 pl-13 pr-5 rounded-pill bg-card border border-line text-fg placeholder:text-fg-subtle shadow-card focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 rounded-pill bg-brand-500 hover:bg-brand-400 text-ink-950 font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {!query && (
            <div className="mt-5 flex items-center gap-3">
              <span className="shrink-0 text-sm text-fg-subtle">Try:</span>
              <div
                className="min-w-0 flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1 -my-1"
                role="list"
              >
                {QUICK_SEARCHES.map((q) => (
                  <Link
                    key={q}
                    role="listitem"
                    href={`/search?q=${encodeURIComponent(q)}`}
                    className="shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-pill border border-line bg-card text-sm font-medium text-fg-muted hover:border-brand-500 hover:text-fg transition-colors"
                  >
                    {q}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && !loading && !error && (
            <p className="mt-5 text-sm font-medium text-fg-muted">
              {total} {total === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        {loading && <ResultsSkeleton />}

        {error && (
          <div className="rounded-card border border-red-200 bg-red-50 px-6 py-5 text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && query && total === 0 && (
          <div className="rounded-card border border-dashed border-line bg-card-2 px-8 py-16 text-center">
            <h2 className="display-sm text-fg text-xl">
              Nothing matched &ldquo;{query}&rdquo;
            </h2>
            <p className="mt-2 text-fg-subtle">
              Try a shorter phrase, a sector name, or browse by category instead.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex px-5 py-2.5 rounded-card bg-brand-500 hover:bg-brand-400 text-ink-950 text-sm font-semibold transition-colors"
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
                      className="group rounded-card border border-line bg-card p-5 hover:border-brand-500 transition-colors"
                    >
                      <span className="grid place-items-center w-10 h-10 rounded-card bg-brand-100 text-brand-700">
                        <Icon name="pin" />
                      </span>
                      <h3 className="mt-4 display-sm text-[17px] text-fg group-hover:text-brand-600 transition-colors">
                        {a.name}
                      </h3>
                      {a.description && (
                        <p className="mt-1.5 text-sm text-fg-subtle clamp-2">{a.description}</p>
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
                      area={p.area ?? undefined}
                      image={p.image ?? undefined}
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
                      author={a.author ?? undefined}
                      featuredImage={a.featuredImage ?? undefined}
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
        <h2 className="display-sm text-fg text-2xl">{title}</h2>
        <span className="text-sm font-semibold text-fg-subtle">{count}</span>
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
          <div className="aspect-[4/3] rounded-card bg-card-2" />
          <div className="h-4 mt-4 rounded bg-card-2 w-3/4" />
          <div className="h-3 mt-2.5 rounded bg-card-2 w-1/2" />
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
