'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './Icons';

const NAV = [
  { label: 'Food & Dining', href: '/category/food-dining' },
  { label: 'Places', href: '/category/travel-places' },
  { label: 'Events', href: '/category/events' },
  { label: 'Stays', href: '/category/stays-accommodation' },
  { label: 'Work', href: '/category/business-work' },
];

const AREAS = [
  { label: 'Sector 29', href: '/area/sector-29' },
  { label: 'Cyber City', href: '/area/cyber-city' },
  { label: 'Golf Course Rd', href: '/area/golf-course-road' },
  { label: 'MG Road', href: '/area/mg-road' },
];

export function Header({
  siteTitle = 'Gurugram Dekho',
  tagline = 'Millennium City guide',
}: {
  siteTitle?: string;
  tagline?: string;
} = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* Thin utility strip: gives the header weight and a place for areas */}
      <div className="hidden lg:block bg-ink-950 text-ink-300 text-[13px]">
        <div className="mx-auto max-w-7xl px-6 h-9 flex items-center justify-between">
          <p className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500" />
            Independent local guide to Gurugram &amp; Gurgaon
          </p>
          <nav className="flex items-center gap-5">
            <span className="text-ink-500">Popular areas:</span>
            {AREAS.map((a) => (
              <Link key={a.href} href={a.href} className="hover:text-white transition-colors">
                {a.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-shadow ${
          scrolled ? 'shadow-[0_1px_0_rgb(11_15_25/0.08),0_8px_24px_-16px_rgb(11_15_25/0.3)]' : 'border-b border-ink-100'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-16 md:h-[72px] flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <span className="relative grid place-items-center w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold text-[15px] shadow-[0_6px_16px_-6px_rgb(255_90_31/0.9)]">
                {siteTitle.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <span className="leading-none">
                <span className="block font-extrabold text-[17px] tracking-tight text-ink-950">
                  {siteTitle}
                </span>
                <span className="block text-[11px] font-medium text-ink-400 mt-1">
                  {tagline}
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 ml-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-lg text-[15px] font-medium text-ink-700 hover:text-ink-950 hover:bg-ink-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop search */}
            <form onSubmit={submit} className="hidden lg:flex ml-auto items-center">
              <div className="relative">
                <Icon
                  name="search"
                  className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder="Search places, guides, sectors…"
                  aria-label="Search"
                  className="w-72 h-11 pl-10 pr-4 rounded-full bg-ink-50 border border-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:bg-white focus:border-ink-200 focus:outline-none transition-colors"
                />
              </div>
            </form>

            {/* Mobile actions */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0 md:hidden">
              <Link
                href="/search"
                aria-label="Search"
                className="grid place-items-center w-10 h-10 rounded-lg text-ink-700 hover:bg-ink-50"
              >
                <Icon name="search" />
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                className="grid place-items-center w-10 h-10 rounded-lg text-ink-900 hover:bg-ink-50"
              >
                <Icon name={open ? 'close' : 'menu'} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sheet */}
        {open && (
          <div className="md:hidden border-t border-ink-100 bg-white">
            <nav className="px-6 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-3.5 border-b border-ink-100 text-ink-900 font-medium"
                >
                  {item.label}
                  <Icon name="chevron" className="w-4 h-4 text-ink-300" />
                </Link>
              ))}
              <p className="eyebrow text-ink-400 pt-5 pb-2">Popular areas</p>
              <div className="flex flex-wrap gap-2 pb-2">
                {AREAS.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    onClick={() => setOpen(false)}
                    className="px-3 py-1.5 rounded-full bg-ink-50 text-sm font-medium text-ink-700"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
