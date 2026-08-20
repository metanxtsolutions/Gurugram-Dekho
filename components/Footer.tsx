import Link from 'next/link';
import { Icon } from './Icons';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Food & Dining', href: '/category/food-dining' },
      { label: 'Travel & Places', href: '/category/travel-places' },
      { label: 'Events', href: '/category/events' },
      { label: 'Shopping', href: '/category/shopping' },
      { label: 'Business & Work', href: '/category/business-work' },
    ],
  },
  {
    title: 'Neighbourhoods',
    links: [
      { label: 'Sector 29', href: '/area/sector-29' },
      { label: 'Cyber City', href: '/area/cyber-city' },
      { label: 'Golf Course Road', href: '/area/golf-course-road' },
      { label: 'MG Road', href: '/area/mg-road' },
      { label: 'Old Gurgaon', href: '/area/old-gurgaon' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy policy', href: '/privacy-policy' },
      { label: 'Terms of use', href: '/terms' },
    ],
  },
];

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
];

export function Footer({
  siteTitle = 'Gurugram Dekho',
  description = 'An independent guide to Gurugram and Gurgaon — food, places, rentals and work, written by people who live here. No paid listings.',
}: {
  siteTitle?: string;
  description?: string;
} = {}) {
  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold text-[15px]">
                GD
              </span>
              <span className="font-extrabold text-[17px] tracking-tight text-white">
                {siteTitle}
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed max-w-sm">{description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full border border-white/12 text-sm hover:bg-white/10 hover:text-white transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="eyebrow text-white mb-4">{col.title}</h3>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3 className="eyebrow text-white mb-4">Weekly digest</h3>
            <p className="text-sm leading-relaxed">
              What opened, what's on, what's worth it. One email, every Friday.
            </p>
            <form className="mt-5 space-y-2.5">
              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/12 text-white text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-500/60"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
              >
                Subscribe
                <Icon name="arrow" className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-500">
          <p>© {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500" />
            Made in Gurugram
          </p>
        </div>
      </div>
    </footer>
  );
}
