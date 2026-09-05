import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarCard } from '@/components/Sidebar';
import { MoveInCalculator } from './MoveInCalculator';

export const metadata: Metadata = {
  title: 'Move-in cost calculator for Gurugram',
  description:
    'Work out the cash you need on day one to rent in Gurugram: deposit, brokerage, first month, maintenance and power backup, with your own numbers.',
  alternates: { canonical: '/tools/move-in-cost' },
};

export default function MoveInCostPage() {
  return (
    <>
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-9">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Tools', href: '/tools' },
              { name: 'Move-in cost', href: '/tools/move-in-cost' },
            ]}
          />
          <h1 className="display mt-6 text-fg text-[2.1rem] md:text-[3rem]">
            How much cash do I need to move in?
          </h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
          <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
            The number a listing never shows. Put in the rent, keep the Gurugram defaults or
            change them, and see what you hand over on the day and what you pay every month
            after that.
          </p>
        </div>
      </section>

      {/* Bottom padding clears the sticky total bar on phones */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14 pb-28 lg:pb-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <Suspense fallback={<div className="rounded-card border border-line bg-card h-[520px]" />}>
              <MoveInCalculator />
            </Suspense>

            <div className="mt-8 rounded-card border border-line bg-card p-5">
              <p className="eyebrow text-fg-subtle">Assumptions and sources</p>
              <ul className="mt-2 text-[14px] text-fg-muted space-y-1.5 list-disc pl-5">
                <li>Defaults reflect what brokers in DLF Phase 3, Sector 56 and Sohna Road quoted in August 2026: two months&apos; deposit, one month&apos;s brokerage.</li>
                <li>Deposits in Gurugram are almost always a multiple of monthly rent, not a fixed sum, which is why the calculator works in months.</li>
                <li>Nothing here is legal or financial advice. It is arithmetic on the numbers you enter.</li>
              </ul>
              <p className="mt-3 text-[12px] text-fg-subtle">Last verified: August 2026</p>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SidebarCard title="Read next">
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/article/moving-to-gurugram-rental-guide" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Moving to Gurugram? Read this before you sign a lease
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">The guide this calculator belongs to.</p>
                </li>
                <li>
                  <Link href="/tools/sector-decoder" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Sector decoder
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Work out where the flat actually is.</p>
                </li>
              </ul>
            </SidebarCard>

            <div className="rounded-card bg-card-2 border border-line p-5 text-[14px] text-fg-muted leading-relaxed">
              <p className="font-medium text-fg">Ask these before you pay the deposit</p>
              <ul className="mt-2 space-y-1.5 list-disc pl-5">
                <li>Is the deposit returned in full, and within how many days?</li>
                <li>Who pays for repainting at the end?</li>
                <li>Is there a lock-in period, and what does leaving early cost?</li>
                <li>Is power backup metered or a flat monthly charge?</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
