import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { Icon } from '@/components/Icons';
import { ImageCredit } from '@/components/ImageCredit';
import { formatDate } from '@/lib/utils';
import { PhotoHero } from '@/components/PhotoHero';
import {
  AreaChips,
  CategoryList,
  NewsletterCard,
  PopularList,
  SidebarCard,
} from '@/components/Sidebar';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      areas: { include: { area: true } },
      featuredImage: true,
    },
  });
}

const RELATED_INCLUDE = {
  author: { select: { name: true } },
  categories: { include: { category: true } },
  featuredImage: true,
} as const;

/**
 * Same-category guides first, topped up from the rest of the site when the
 * category is thin. Without the top-up a category holding two articles left a
 * single card sitting in a three-column grid.
 */
async function getRelated(articleId: string, categoryId?: string) {
  const sameCategory = categoryId
    ? await prisma.article.findMany({
        where: {
          status: 'published',
          isActive: true,
          id: { not: articleId },
          categories: { some: { categoryId } },
        },
        include: RELATED_INCLUDE,
        orderBy: { publishedAt: 'desc' },
        take: 3,
      })
    : [];

  if (sameCategory.length >= 3) return sameCategory;

  const exclude = [articleId, ...sameCategory.map((a) => a.id)];
  const topUp = await prisma.article.findMany({
    where: { status: 'published', isActive: true, id: { notIn: exclude } },
    include: RELATED_INCLUDE,
    orderBy: { publishedAt: 'desc' },
    take: 3 - sameCategory.length,
  });

  return [...sameCategory, ...topUp];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article not found' };

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: 'article',
      images: article.featuredImage ? [article.featuredImage.url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const primaryCategory = article.categories[0]?.category;
  const [related, popular, allCategories, sidebarAreas] = await Promise.all([
    getRelated(article.id, primaryCategory?.id),
    prisma.article.findMany({
      where: { status: 'published', isActive: true, id: { not: article.id } },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, viewCount: true, featuredImage: { select: { url: true } } },
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
    }),
    prisma.area.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 8,
      select: { id: true, name: true, slug: true, _count: { select: { places: true } } },
    }),
  ]);

  /* Prefer the stored value. Computing it here alone made this page disagree
     with the archive rows, which read `readMins` straight off the record. */
  const readMins =
    article.readMins ??
    Math.max(
      1,
      Math.round((article.content?.replace(/<[^>]+>/g, ' ').split(/\s+/).length ?? 0) / 200)
    );

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { '@type': 'Person', name: article.author.name },
    publisher: { '@type': 'Organization', name: 'Gurugram Dekho' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── Hero: the title sits on the featured image, as on the reference ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5">
        <Breadcrumb
          items={[
            { name: 'Home', href: '/' },
            ...(primaryCategory
              ? [{ name: primaryCategory.name, href: `/category/${primaryCategory.slug}` }]
              : []),
            { name: article.title, href: `/article/${article.slug}` },
          ]}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-10 md:pb-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <PhotoHero
              image={article.featuredImage?.url ?? null}
              name={article.title}
              label={primaryCategory?.name}
              priority
            >
              {primaryCategory && (
                <Link
                  href={`/category/${primaryCategory.slug}`}
                  className="inline-flex px-3 py-1 rounded-pill bg-brand-500 text-ink-950 text-[11px] font-semibold tracking-wide hover:bg-brand-400 transition-colors"
                >
                  {primaryCategory.name}
                </Link>
              )}
              <h1 className="display mt-3.5 text-white text-[1.9rem] md:text-[2.9rem]">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mt-3.5 text-[15px] md:text-[17px] text-white/80 leading-relaxed max-w-2xl">
                  {article.excerpt}
                </p>
              )}
            </PhotoHero>

            {article.featuredImage && <ImageCredit image={article.featuredImage} className="px-1" />}

            {/* Byline sits under the image card, as on the reference */}
            <div className="mt-5 pb-5 border-b border-line flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-fg-subtle">
              <span className="grid place-items-center w-8 h-8 rounded-full bg-brand-500 text-ink-950 text-[13px] font-bold">
                {article.author.name.charAt(0)}
              </span>
              <span className="font-semibold text-fg">{article.author.name}</span>
              <span aria-hidden="true">·</span>
              {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" className="w-3.5 h-3.5" />
                {readMins} min read
              </span>
              {article.viewCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{article.viewCount.toLocaleString()} views</span>
                </>
              )}
            </div>

            <div
              className="prose-gd mt-8"
              dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
            />

        {article.areas.length > 0 && (
          <div className="mt-12 pt-8 border-t border-line">
            <p className="eyebrow text-fg-subtle mb-3">Areas covered</p>
            <div className="flex flex-wrap gap-2">
              {article.areas.map(({ area }) => (
                <Link
                  key={area.id}
                  href={`/area/${area.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-card-2 border border-line text-sm font-medium text-fg-muted hover:border-brand-500 hover:text-brand-600 transition-colors"
                >
                  <Icon name="pin" className="w-3.5 h-3.5" />
                  {area.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {article.tags.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow text-fg-subtle mb-3">Tagged</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-3 py-1.5 rounded-pill bg-card-2 text-sm font-medium text-fg-muted"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

            {/* Author */}
            <div className="mt-10 rounded-card bg-card-2 border border-line p-5 flex gap-4">
              <span className="grid place-items-center w-12 h-12 shrink-0 rounded-full bg-brand-500 text-ink-950 font-bold">
                {article.author.name.charAt(0)}
              </span>
              <div>
                <p className="eyebrow text-fg-subtle">Written by</p>
                <p className="mt-1 font-bold text-fg">{article.author.name}</p>
                {article.author.bio && (
                  <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">
                    {article.author.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar, matching the archive pages so the site reads as one thing */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SidebarCard title="Categories">
              <CategoryList
                items={allCategories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  count: c._count.articles,
                }))}
                activeSlug={primaryCategory?.slug}
              />
            </SidebarCard>

            <SidebarCard title="People read">
              <PopularList items={popular} />
            </SidebarCard>

            <SidebarCard title="Browse by area">
              <AreaChips
                items={sidebarAreas.map((a) => ({
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

      {related.length > 0 && (
        <section className="bg-card-2/70 border-t border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
            <div className="mb-8">
              <h2 className="display text-fg text-[28px] md:text-[38px]">You may also like</h2>
              <span className="block mt-4 h-[3px] w-14 rounded-full bg-brand-500" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <ArticleCard
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  slug={r.slug}
                  excerpt={r.excerpt ?? undefined}
                  publishedAt={r.publishedAt ?? undefined}
                  author={r.author}
                  viewCount={r.viewCount}
                  featuredImage={r.featuredImage}
                  category={r.categories[0]?.category}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
