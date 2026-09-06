import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarCard } from '@/components/Sidebar';
import { PgChecklist } from './PgChecklist';

export const metadata: Metadata = {
  title: 'PG safety checklist for Gurugram',
  description:
    'Sixteen things to check at a PG viewing in Gurugram, what each one protects you from, and the exact question to ask. Tick them on your phone in the room.',
  alternates: { canonical: '/tools/pg-checklist' },
};

export default function PgChecklistPage() {
  return (
    <>
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-9">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Tools', href: '/tools' },
              { name: 'PG checklist', href: '/tools/pg-checklist' },
            ]}
          />
          <h1 className="display mt-6 text-fg text-[2.1rem] md:text-[3rem]">
            What to check before you take a PG
          </h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
          <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
            Take this to the viewing. Each item says what it protects you from and the question
            to ask out loud. Your ticks stay on your phone, so the second viewing starts where the
            first one left off.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <PgChecklist />
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start no-print">
            <SidebarCard title="Read next">
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/article/moving-to-gurugram-rental-guide" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Moving to Gurugram? Read this before you sign a lease
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">The longer version, for flats as well as PGs.</p>
                </li>
                <li>
                  <Link href="/tools/move-in-cost" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Move-in cost calculator
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Deposit and first month, with your numbers.</p>
                </li>
                <li>
                  <Link href="/tools/commute" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Commute comparison
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Test the journey before you commit to the room.</p>
                </li>
              </ul>
            </SidebarCard>

            <div className="rounded-card bg-card-2 border border-line p-5 text-[14px] text-fg-muted leading-relaxed">
              <p className="font-medium text-fg">The one rule</p>
              <p className="mt-1.5">
                If an owner will not put the deposit terms in writing, the answer is no, however good
                the room is. Everything else on the list can be fixed. That cannot.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
