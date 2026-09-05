'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { label: 'Food & Dining', href: '/category/food-dining' },
  { label: 'Travel & Places', href: '/category/travel-places' },
  { label: 'Events', href: '/category/events' },
  { label: 'Stays & PGs', href: '/category/stays-accommodation' },
  { label: 'Work', href: '/category/business-work' },
];

const AREAS = [
  { label: 'Sector 29', href: '/area/sector-29' },
  { label: 'Cyber City', href: '/area/cyber-city' },
  { label: 'Golf Course Road', href: '/area/golf-course-road' },
  { label: 'MG Road', href: '/area/mg-road' },
  { label: 'Old Gurgaon', href: '/area/old-gurgaon' },
  { label: 'Sohna Road', href: '/area/sohna-road' },
];

export function Header({
  siteTitle = 'Gurugram Dekho',
}: {
  siteTitle?: string;
  tagline?: string;
} = {}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Lock body scroll while the menu sheet is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Opening search should put the caret in the field, not make the user click again
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Escape closes whichever overlay is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setMenuOpen(false);
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-page/92 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Three columns, so the wordmark sits dead centre at every width */}
        <div className="h-[68px] grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="grid place-items-center w-10 h-10 rounded-full text-fg hover:bg-card-2 transition-colors"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="w-6 h-6" />
            </button>
          </div>

          {/* Wrapped rather than passing responsive classes to Wordmark: its root
              already sets inline-flex, which would beat a `hidden` on the same
              element and render both sizes at once. */}
          <Link href="/" aria-label={siteTitle} className="justify-self-center">
            <span className="block sm:hidden">
              <Wordmark size="sm" />
            </span>
            <span className="hidden sm:block">
              <Wordmark size="md" />
            </span>
          </Link>

          <div className="flex items-center justify-end gap-0.5">
            <ThemeToggle />
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? 'Close search' : 'Search'}
              aria-expanded={searchOpen}
              className="grid place-items-center w-10 h-10 rounded-full text-fg-muted hover:text-fg hover:bg-card-2 transition-colors"
            >
              <Icon name={searchOpen ? 'close' : 'search'} className="w-[19px] h-[19px]" />
            </button>
          </div>
        </div>

        {/* Category rail, desktop only. Doubles as internal linking for search. */}
        <nav className="hidden md:flex items-center justify-center gap-1 pb-2.5 -mt-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 rounded-pill text-[14px] font-medium text-fg-muted hover:text-fg hover:bg-card-2 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search drops out of the header rather than covering the page */}
      {searchOpen && (
        <div className="border-t border-line bg-page">
          <form onSubmit={submit} className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
            <div className="relative">
              <Icon
                name="search"
                className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle"
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search places, guides, sectors…"
                aria-label="Search"
                className="w-full h-12 pl-11 pr-4 rounded-pill bg-card-2 border border-line text-[15px] text-fg placeholder:text-fg-subtle focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </form>
        </div>
      )}

      {/* Menu sheet */}
      {menuOpen && (
        <div className="border-t border-line bg-page max-h-[calc(100vh-68px)] overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 grid gap-7 md:grid-cols-2">
            <div>
              <p className="eyebrow text-fg-subtle pb-1">Browse</p>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3 border-b border-line font-display font-semibold text-[17px] text-fg hover:text-brand-600 transition-colors"
                >
                  {item.label}
                  <Icon name="chevron" className="w-4 h-4 text-fg-subtle" />
                </Link>
              ))}
            </div>

            <div>
              <p className="eyebrow text-fg-subtle pb-3">Popular areas</p>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3.5 py-2 rounded-pill bg-card-2 border border-line text-sm font-medium text-fg hover:border-brand-500 transition-colors"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>

              <p className="eyebrow text-fg-subtle pt-6 pb-3">More</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-fg-muted">
                <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-fg">
                  About
                </Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="hover:text-fg">
                  Contact
                </Link>
                <Link href="/tools" onClick={() => setMenuOpen(false)} className="hover:text-fg">
                  Tools
                </Link>
                <Link href="/search" onClick={() => setMenuOpen(false)} className="hover:text-fg">
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
