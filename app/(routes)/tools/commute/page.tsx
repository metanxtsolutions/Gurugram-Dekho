import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarCard } from '@/components/Sidebar';
import { CommuteCompare } from './CommuteCompare';

export const metadata: Metadata = {
  title: 'Commute comparison: metro vs cab vs auto in Gurugram',
  description:
    'Pick two places in Gurugram and a time of day, and compare the metro, a cab and an auto on time, cost and whether they are even an option.',
  alternates: { canonical: '/tools/commute' },
};

/* Rendered per request so the URL choice is in the first HTML. See the note on
   the move-in cost page for why. */
export const dynamic = 'force-dynamic';

export default function CommutePage() {
  return (
    <>
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-9">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Tools', href: '/tools' },
              { name: 'Commute', href: '/tools/commute' },
            ]}
          />
          <h1 className="display mt-6 text-fg text-[2.1rem] md:text-[3rem]">
            Metro, cab or auto?
          </h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
          <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
            The same trip is a different answer at 9am, 3pm and midnight. Pick where you are going
            and when, and see what each option really costs in time and money.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <Suspense fallback={<div className="rounded-card border border-line bg-card h-[420px]" />}>
              <CommuteCompare />
            </Suspense>
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SidebarCard title="Read next">
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/article/rapid-metro-gurugram-explained" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    The Rapid Metro, explained for new residents
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Which line goes where, and the Sikanderpur change.</p>
                </li>
                <li>
                  <Link href="/tools/sector-decoder" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Sector decoder
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Which station is nearest to any sector.</p>
                </li>
                <li>
                  <Link href="/tools/move-in-cost" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Move-in cost calculator
                  </Link>
                </li>
              </ul>
            </SidebarCard>

            <div className="rounded-card bg-card-2 border border-line p-5 text-[14px] text-fg-muted leading-relaxed">
              <p className="font-medium text-fg">Before you sign a lease</p>
              <p className="mt-1.5">
                Do the commute once at 9am on a weekday, not on the Sunday you view the flat. Sohna Road
                in particular is a different road at 6pm.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
