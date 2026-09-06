'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './Icons';
import { QUICK_SEARCHES } from '@/lib/content';

/**
 * The homepage search. Split into its own client component so the page itself
 * stays a server component and keeps its database rendering.
 */
export function HomeSearch({
  className = '',
  align = 'center',
  onDark = false,
}: {
  className?: string;
  /** The hero is left-aligned; the search sits with it rather than centred. */
  align?: 'center' | 'left';
  /** On the photo hero: the field stays white, the chips go translucent. */
  onDark?: boolean;
}) {
  const centred = align === 'center';
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className={className}>
      {/*
        The button overlays the field from `sm` up. On a phone it sits below
        instead: overlaid, it ate enough of a 390px field to clip the
        placeholder mid-word.
      */}
      <form onSubmit={submit} className={`max-w-xl ${centred ? 'mx-auto' : ''}`}>
        <div className="relative">
          <Icon
            name="search"
            className="w-5 h-5 absolute left-5 top-7 -translate-y-1/2 text-fg-subtle"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Try “rooftop in Sector 29”"
            aria-label="Search Gurugram Dekho"
            className={`w-full h-14 pl-13 pr-5 sm:pr-32 rounded-pill text-[15px] shadow-card focus:outline-none focus:border-brand-500 transition-colors ${
              onDark
                ? 'bg-white border-white text-ink-950 placeholder:text-ink-500'
                : 'bg-card border border-line text-fg placeholder:text-fg-subtle'
            }`}
          />
          <button
            type="submit"
            className="mt-2.5 w-full h-12 sm:mt-0 sm:w-auto sm:absolute sm:right-1.5 sm:top-1.5 sm:h-11 px-6 rounded-pill bg-brand-500 text-ink-950 font-semibold text-[15px] hover:bg-brand-400 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className={`mt-5 flex flex-wrap items-center gap-2 ${centred ? 'justify-center' : ''}`}>
        <span className={`text-[13px] ${onDark ? 'text-white/70' : 'text-fg-subtle'}`}>Popular:</span>
        {QUICK_SEARCHES.slice(0, 3).map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className={`px-3.5 py-1.5 rounded-pill border text-[13px] font-medium transition-colors ${
              onDark
                ? 'bg-white/12 border-white/25 text-white hover:bg-brand-500 hover:border-brand-500 hover:text-ink-950'
                : 'bg-card-2 border-line text-fg-muted hover:text-fg hover:border-brand-500'
            }`}
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
