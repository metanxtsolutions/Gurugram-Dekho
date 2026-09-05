import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarCard } from '@/components/Sidebar';
import { SectorDecoder, type DecoderArea } from './SectorDecoder';

export const metadata: Metadata = {
  title: 'Sector decoder: what is that Gurugram sector?',
  description:
    'Type a Gurugram sector number or area name and get where it is, the nearest metro, what it is like, and the guides and places we have there.',
  alternates: { canonical: '/tools/sector-decoder' },
};

// Areas change when an editor publishes, not per request.
export const revalidate = 300;

async function getAreas(): Promise<DecoderArea[]> {
  try {
    const rows = await prisma.area.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        slug: true,
        name: true,
        tagline: true,
        description: true,
        _count: { select: { places: { where: { status: 'published' } } } },
        articles: {
          where: { article: { status: 'published', isActive: true } },
          select: { article: { select: { title: true, slug: true } } },
          take: 6,
        },
        places: {
          where: { status: 'published' },
          orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
          select: { name: true, slug: true, placeType: true },
          take: 6,
        },
      },
    });

    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      placeCount: r._count.places,
      guides: r.articles.map((a) => a.article),
      places: r.places,
    }));
  } catch (error) {
    // The decoder still works on its editorial notes alone; it just cannot
    // list guides and places until the database is reachable.
    console.error('Sector decoder: area lookup failed, serving notes only', error);
    return [];
  }
}

export default async function SectorDecoderPage() {
  const areas = await getAreas();

  return (
    <>
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-9">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Tools', href: '/tools' },
              { name: 'Sector decoder', href: '/tools/sector-decoder' },
            ]}
          />
          <h1 className="display mt-6 text-fg text-[2.1rem] md:text-[3rem]">
            Sector numbers, in plain English
          </h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
          <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
            Nobody arrives knowing what Sector 29 is. Type the number from the listing or the
            name someone mentioned, and get the short version.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <Suspense fallback={<div className="rounded-card border border-line bg-card h-[200px]" />}>
              <SectorDecoder areas={areas} />
            </Suspense>
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SidebarCard title="Read next">
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/tools/move-in-cost" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Move-in cost calculator
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">Once you know where, work out how much.</p>
                </li>
                <li>
                  <Link href="/article/moving-to-gurugram-rental-guide" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Moving to Gurugram? Read this before you sign a lease
                  </Link>
                </li>
                <li>
                  <Link href="/article/cyber-hub-vs-cyber-city-2026" className="font-medium text-fg hover:text-brand-600 transition-colors">
                    Cyber Hub vs Cyber City
                  </Link>
                  <p className="text-[13px] text-fg-subtle mt-0.5">The two names everyone mixes up.</p>
                </li>
              </ul>
            </SidebarCard>

            <div className="rounded-card bg-card-2 border border-line p-5 text-[14px] text-fg-muted leading-relaxed">
              <p className="font-medium text-fg">How sector numbers work</p>
              <p className="mt-1.5">
                They were assigned as land was planned, not by where things are, so 29 and 56 are
                not near each other and 24 is both Cyber City and DLF Phase 3. Low numbers are
                mostly the old town. The Rapid Metro loop covers 24 through 56 along Golf Course
                Road. Everything south of 47 is Sohna Road country.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
