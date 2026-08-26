import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { Placeholder } from '@/components/Placeholder';
import {
  AreaChips,
  CategoryList,
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

  // A thin category still deserves a full page, offer the wider catalogue.
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

  const sortHref = (s: Sort) => `/category/${category.slug}${s === 'latest' ? '' : '?sort=popular'}`;
  const pageHref = (n: number) =>
    `/category/${category.slug}?page=${n}${sort === 'popular' ? '&sort=popular' : ''}`;

  return (
    <>
      {/* Header band. The dark panel this replaced belonged to the previous
          visual direction, and its muted text tokens went dark-on-dark. */}
      <section className="border-b border-line bg-card-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-10 md:pb-12">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              ...(category.parent
                ? [{ name: category.parent.name, href: `/category/${category.parent.slug}` }]
                : []),
              { name: category.name, href: `/category/${category.slug}` },
            ]}
          />

          <h1 className="display mt-6 text-fg text-[2.2rem] md:text-[3.25rem]">{category.name}</h1>
          <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />

          {category.description && (
            <p className="mt-5 text-[16px] md:text-[17px] text-fg-muted max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="text-sm font-medium text-fg-muted">
              {total} {total === 1 ? 'guide' : 'guides'}
            </p>
            {total > 1 && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-fg-subtle mr-0.5">Sort:</span>
                {(['latest', 'popular'] as Sort[]).map((srt) => (
                  <Link
                    key={srt}
                    href={sortHref(srt)}
                    aria-current={sort === srt ? 'true' : undefined}
                    className={`px-3.5 py-1.5 rounded-pill border transition-colors ${
                      sort === srt
                        ? 'bg-brand-500 border-brand-500 text-ink-950 font-semibold'
                        : 'bg-card border-line text-fg-muted hover:border-brand-500 hover:text-fg'
                    }`}
                  >
                    {srt === 'latest' ? 'Latest' : 'Most read'}
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
                  className="px-3.5 py-1.5 rounded-pill border border-line bg-card text-sm font-medium text-fg-muted hover:border-brand-500 hover:text-fg transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Main column */}
          <div className="lg:col-span-8 min-w-0">
            {articles.length === 0 ? (
              <EmptyState categoryName={category.name} />
            ) : (
              /* A vertical list rather than a grid: the reference archive reads
                 as one column of rows, which also gives the excerpt room. */
              <div className="divide-y divide-line">
                {articles.map((article, i) => (
                  <ArticleRow
                    key={article.id}
                    href={`/article/${article.slug}`}
                    image={article.featuredImage?.url ?? null}
                    title={article.title}
                    excerpt={article.excerpt}
                    category={article.categories[0]?.category?.name}
                    author={article.author.name}
                    date={article.publishedAt ? formatDate(article.publishedAt) : null}
                    readMins={article.readMins ?? 5}
                    priority={i === 0}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <PageLink href={pageHref(page - 1)}>Previous</PageLink>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={pageHref(n)}
                    aria-current={n === page ? 'page' : undefined}
                    className={`grid place-items-center min-w-10 h-10 px-3 rounded-pill text-sm font-semibold transition-colors ${
                      n === page
                        ? 'bg-brand-500 text-ink-950'
                        : 'bg-card border border-line text-fg-muted hover:border-brand-500 hover:text-fg'
                    }`}
                  >
                    {n}
                  </Link>
                ))}
                {page < totalPages && <PageLink href={pageHref(page + 1)}>Next</PageLink>}
              </nav>
            )}

            {elsewhere.length > 0 && (
              <section className="mt-14 pt-12 border-t border-line">
                <h2 className="display-sm text-fg text-2xl pb-2.5 border-b-2 border-brand-500 inline-block">
                  Elsewhere on the site
                </h2>
                <div className="grid sm:grid-cols-3 gap-5 mt-8">
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

function PageLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="h-10 px-4 grid place-items-center rounded-pill bg-card border border-line text-sm font-semibold text-fg-muted hover:border-brand-500 hover:text-fg transition-colors"
    >
      {children}
    </Link>
  );
}

/** One row in the archive list: thumbnail, category, title, excerpt, byline. */
function ArticleRow({
  href,
  image,
  title,
  excerpt,
  category,
  author,
  date,
  readMins,
  priority = false,
}: {
  href: string;
  image: string | null;
  title: string;
  excerpt: string | null;
  category?: string;
  author: string;
  date: string | null;
  readMins: number;
  priority?: boolean;
}) {
  return (
    <Link href={href} className="group flex gap-4 sm:gap-5 py-6 first:pt-0">
      <div className="relative w-[112px] sm:w-[220px] shrink-0 aspect-[4/3] overflow-hidden rounded-card bg-card-2">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 112px, 220px"
            className="object-cover zoom-target"
          />
        ) : (
          <Placeholder name={title} label={category} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {category && <p className="eyebrow text-brand-600">{category}</p>}
        <h2 className="display-sm text-[18px] sm:text-[23px] text-fg mt-1.5 clamp-3 group-hover:text-brand-600 transition-colors">
          {title}
        </h2>
        {excerpt && (
          <p className="mt-2 text-[14px] text-fg-muted clamp-2 hidden sm:block leading-relaxed">
            {excerpt}
          </p>
        )}
        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-fg-subtle">
          <span className="font-medium text-fg-muted">{author}</span>
          {date && (
            <>
              <span aria-hidden="true">·</span>
              <span>{date}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{readMins} min read</span>
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-card-2 px-8 py-16 text-center">
      <h2 className="display-sm text-fg text-xl">No guides in {categoryName} yet</h2>
      <p className="mt-2 text-fg-subtle">
        We&apos;re working on this section. Try another category from the sidebar.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex px-5 py-2.5 rounded-pill bg-brand-500 hover:bg-brand-400 text-ink-950 text-sm font-semibold transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
