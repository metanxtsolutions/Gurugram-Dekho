import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { Icon } from '@/components/Icons';
import {
  AreaChips,
  CategoryList,
  FeatureRow,
  NewsletterCard,
  PopularList,
  SidebarCard,
} from '@/components/Sidebar';
import { formatDate } from '@/lib/utils';

const PER_PAGE = 9;

type Sort = 'latest' | 'popular';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: true, parent: true },
  });
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Category not found' };

  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || undefined,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const sort: Sort = sortParam === 'popular' ? 'popular' : 'latest';

  const where = {
    status: 'published',
    isActive: true,
    categories: { some: { categoryId: category.id } },
  };

  const [articles, total, popular, allCategories, areas] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { name: true } },
        categories: { include: { category: true } },
        featuredImage: true,
      },
      orderBy: sort === 'popular' ? { viewCount: 'desc' } : { publishedAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.article.count({ where }),
    prisma.article.findMany({
      where: { status: 'published', isActive: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        featuredImage: { select: { url: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { articles: true } },
      },
    }),
    prisma.area.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 8,
      select: { id: true, name: true, slug: true, _count: { select: { places: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // A thin category still deserves a full page — offer the wider catalogue.
  const elsewhere =
    articles.length < 4
      ? await prisma.article.findMany({
          where: {
            status: 'published',
            isActive: true,
            NOT: { categories: { some: { categoryId: category.id } } },
          },
          include: {
            author: { select: { name: true } },
            categories: { include: { category: true } },
            featuredImage: true,
          },
          orderBy: { publishedAt: 'desc' },
          take: 3,
        })
      : [];

  // The first item on page one gets the wide treatment.
  const showLead = page === 1 && articles.length > 1;
  const lead = showLead ? articles[0] : null;
  const gridArticles = showLead ? articles.slice(1) : articles;

  const sortHref = (s: Sort) => `/category/${category.slug}${s === 'latest' ? '' : '?sort=popular'}`;

  return (
    <>
      {/* Header band */}
      <section className="bg-ink-950 relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-24 left-1/3 w-[32rem] h-[32rem] rounded-full bg-brand-500/15 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
          <Breadcrumb
            tone="light"
            items={[
              { name: 'Home', href: '/' },
              ...(category.parent
                ? [{ name: category.parent.name, href: `/category/${category.parent.slug}` }]
                : []),
              { name: category.name, href: `/category/${category.slug}` },
            ]}
          />
          <h1 className="display mt-6 text-white text-4xl md:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-4 text-lg text-ink-300 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="text-sm text-ink-400">
              {total} {total === 1 ? 'guide' : 'guides'}
            </p>
            {total > 1 && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-ink-500 mr-1">Sort:</span>
                {(['latest', 'popular'] as Sort[]).map((s) => (
                  <Link
                    key={s}
                    href={sortHref(s)}
                    aria-current={sort === s ? 'true' : undefined}
                    className={`px-3 py-1 rounded-full capitalize transition-colors ${
                      sort === s
                        ? 'bg-white text-ink-950 font-semibold'
                        : 'text-ink-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s === 'latest' ? 'Latest' : 'Most read'}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {category.children.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {category.children.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-sm text-ink-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Main column */}
          <div className="lg:col-span-8 min-w-0">
            {articles.length === 0 ? (
              <EmptyState categoryName={category.name} />
            ) : (
              <>
                {lead && (
                  <div className="mb-10">
                    <FeatureRow
                      href={`/article/${lead.slug}`}
                      image={lead.featuredImage?.url ?? null}
                      eyebrow={sort === 'popular' ? 'Most read' : 'Latest'}
                      title={lead.title}
                      excerpt={lead.excerpt}
                      meta={
                        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-400">
                          <span className="font-semibold text-ink-600">{lead.author.name}</span>
                          <span aria-hidden="true">·</span>
                          {lead.publishedAt && <span>{formatDate(lead.publishedAt)}</span>}
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Icon name="clock" className="w-3.5 h-3.5" />
                            {lead.readMins ?? 5} min read
                          </span>
                        </p>
                      }
                    />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-8">
                  {gridArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      id={article.id}
                      title={article.title}
                      slug={article.slug}
                      excerpt={article.excerpt ?? undefined}
                      publishedAt={article.publishedAt ?? undefined}
                      author={article.author}
                      viewCount={article.viewCount}
                      featuredImage={article.featuredImage}
                      category={article.categories[0]?.category}
                    />
                  ))}
                </div>
              </>
            )}

            {totalPages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-3" aria-label="Pagination">
                <PageLink
                  href={`/category/${category.slug}?page=${page - 1}${sort === 'popular' ? '&sort=popular' : ''}`}
                  disabled={page <= 1}
                >
                  Previous
                </PageLink>
                <span className="px-4 text-sm text-ink-500">
                  Page {page} of {totalPages}
                </span>
                <PageLink
                  href={`/category/${category.slug}?page=${page + 1}${sort === 'popular' ? '&sort=popular' : ''}`}
                  disabled={page >= totalPages}
                >
                  Next
                </PageLink>
              </nav>
            )}

            {elsewhere.length > 0 && (
              <section className="mt-16 pt-12 border-t border-ink-100">
                <p className="eyebrow text-brand-600">Elsewhere on the site</p>
                <h2 className="display-sm mt-2.5 mb-8 text-ink-950 text-2xl">
                  More from Gurugram Dekho
                </h2>
                <div className="grid sm:grid-cols-3 gap-8">
                  {elsewhere.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.id}
                      title={a.title}
                      slug={a.slug}
                      excerpt={a.excerpt ?? undefined}
                      publishedAt={a.publishedAt ?? undefined}
                      author={a.author}
                      featuredImage={a.featuredImage}
                      category={a.categories[0]?.category}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <SidebarCard title="Popular this week">
              <PopularList items={popular} />
            </SidebarCard>

            <SidebarCard title="All categories">
              <CategoryList
                items={allCategories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  count: c._count.articles,
                }))}
                activeSlug={category.slug}
              />
            </SidebarCard>

            <SidebarCard title="Browse by area">
              <AreaChips
                items={areas.map((a) => ({
                  id: a.id,
                  name: a.name,
                  slug: a.slug,
                  places: a._count.places,
                }))}
              />
            </SidebarCard>

            <NewsletterCard />
          </aside>
        </div>
      </div>
    </>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="px-5 py-2.5 rounded-xl border border-ink-100 text-sm font-medium text-ink-300 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="px-5 py-2.5 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 hover:border-brand-500 hover:text-brand-600 transition-colors"
    >
      {children}
    </Link>
  );
}

function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-8 py-16 text-center">
      <h2 className="font-bold text-ink-900 text-lg">No guides in {categoryName} yet</h2>
      <p className="mt-2 text-ink-500">
        We&apos;re working on this section. Try another category from the sidebar.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
