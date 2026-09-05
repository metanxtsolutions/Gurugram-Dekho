import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Icon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Tools for living in Gurugram',
  description:
    'Small calculators and lookups that answer with your own numbers: move-in cost, sector decoder, and more as they are built.',
  alternates: { canonical: '/tools' },
};

/*
  Hand-listed, like the Explore cards. A tool is a promise that the numbers
  behind it are maintained, so one only appears here once that is true.
*/
const TOOLS = [
  {
    href: '/tools/move-in-cost',
    icon: 'home',
    name: 'Move-in cost calculator',
    blurb: 'Deposit, brokerage, first month, maintenance and power backup. The cash you need on day one, with your own rent.',
    verified: 'August 2026',
  },
  {
    href: '/tools/sector-decoder',
    icon: 'map',
    name: 'Sector decoder',
    blurb: 'Type a sector number or an area name. Get where it is, the nearest metro, what it is like, and what we have written about it.',
    verified: 'August 2026',
  },
] as const;

const COMING = [
  { name: 'PG safety checklist', when: 'next' },
  { name: 'Commute comparison: metro vs cab vs auto', when: 'next' },
  { name: 'Open now filter', when: 'soon' },
];

export default function ToolsPage() {
  return (
    <>
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-9">
          <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }]} />
          <h1 className="display mt-6 text-fg text-[2.1rem] md:text-[3rem]">Tools</h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
          <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
            Small things that answer with your numbers instead of ours. Each one says when its
            figures were last checked.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-card border border-line bg-card p-5 sm:p-6 hover:border-brand-500 transition-colors"
            >
              <span className="grid place-items-center w-11 h-11 rounded-full bg-brand-500 text-ink-950">
                <Icon name={t.icon} className="w-5 h-5" />
              </span>
              <h2 className="display-sm mt-4 text-fg text-[21px] group-hover:text-brand-600 transition-colors">
                {t.name}
              </h2>
              <p className="mt-2 text-[15px] text-fg-muted leading-relaxed">{t.blurb}</p>
              <p className="mt-4 text-[12px] text-fg-subtle">Figures verified {t.verified}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 max-w-2xl">
          <p className="eyebrow text-fg-subtle">Being built</p>
          <ul className="mt-2 divide-y divide-line">
            {COMING.map((c) => (
              <li key={c.name} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                <span className="text-fg">{c.name}</span>
                <span className="px-2.5 py-1 rounded-pill bg-card-2 border border-line text-[12px] text-fg-muted">{c.when}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] text-fg-muted">
            Want one that is not here? <Link href="/contact" className="text-brand-600 hover:text-brand-700">Tell us what you are trying to work out.</Link>
          </p>
        </div>
      </div>
    </>
  );
}
