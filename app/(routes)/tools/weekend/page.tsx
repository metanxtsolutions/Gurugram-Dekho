import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarCard } from '@/components/Sidebar';
import { WeekendPicker } from './WeekendPicker';

export const metadata: Metadata = {
  title: 'Weekend picker for Gurugram',
  description:
    'Say how long you have, what you want to spend and whether you have a car, and get three things worth doing this weekend in Gurugram.',
  alternates: { canonical: '/tools/weekend' },
};

/* Rendered per request so the URL choice is in the first HTML. */
export const dynamic = 'force-dynamic';

async function publishedSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.article.findMany({
      where: { status: 'published', isActive: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch (error) {
    // Ideas that point at areas still work; article-backed ones wait.
    console.error('Weekend picker: slug lookup failed', error);
    return [];
  }
}

export default async function WeekendPage() {
  const published = await publishedSlugs();

  return (
    <>
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-9">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Tools', href: '/tools' },
              { name: 'Weekend', href: '/tools/weekend' },
            ]}
          />
          <h1 className="display mt-6 text-fg text-[2.1rem] md:text-[3rem]">What should we do this weekend?</h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
          <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
            Three questions, three answers. Everything here is something someone on this site has
            actually done, with the guide that goes with it.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <Suspense fallback={<div className="rounded-card border border-line bg-card h-[360px]" />}>
              <WeekendPicker published={published} />
            </Suspense>
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SidebarCard title="Read next">
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/tools/open-now" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    What is open right now
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Checked against real hours, in Gurugram time.</p>
                </li>
                <li>
                  <Link href="/article/weekend-escapes-near-gurugram" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Weekend escapes within 90 minutes
                  </Link>
                </li>
                <li>
                  <Link href="/tools/commute" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Commute comparison
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Getting there without the car.</p>
                </li>
              </ul>
            </SidebarCard>

            <div className="rounded-card bg-card-2 border border-line p-5 text-[14px] text-fg-muted leading-relaxed">
              <p className="font-medium text-fg">The honest note</p>
              <p className="mt-1.5">
                These are our picks, not a ranking. Nothing here paid to appear, and when a place
                stops being worth it, it comes off the list.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
