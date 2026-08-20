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

async function getRelated(articleId: string, categoryId?: string) {
  return prisma.article.findMany({
    where: {
      status: 'published',
      id: { not: articleId },
      ...(categoryId ? { categories: { some: { categoryId } } } : {}),
    },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: true } },
      featuredImage: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });
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
  const related = await getRelated(article.id, primaryCategory?.id);

  const readMins = Math.max(
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

      {/* Hero */}
      <section className="bg-ink-950 relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-32 right-1/4 w-[34rem] h-[34rem] rounded-full bg-brand-500/15 blur-[110px]" />
        <div className="relative mx-auto max-w-3xl px-6 py-10 md:py-14">
          <Breadcrumb
            tone="light"
            items={[
              { name: 'Home', href: '/' },
              ...(primaryCategory
                ? [{ name: primaryCategory.name, href: `/category/${primaryCategory.slug}` }]
                : []),
              { name: article.title, href: `/article/${article.slug}` },
            ]}
          />

          {primaryCategory && (
            <Link
              href={`/category/${primaryCategory.slug}`}
              className="inline-flex mt-7 px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold tracking-wide"
            >
              {primaryCategory.name}
            </Link>
          )}

          <h1 className="display mt-5 text-white text-[2.1rem] md:text-5xl">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-5 text-lg text-ink-300 leading-relaxed">{article.excerpt}</p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-400">
            <span className="font-semibold text-ink-200">{article.author.name}</span>
            <span aria-hidden="true">·</span>
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" className="w-4 h-4" />
              {readMins} min read
            </span>
            {article.viewCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{article.viewCount.toLocaleString()} views</span>
              </>
            )}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {article.featuredImage && (
          <figure className="-mt-24 md:-mt-28 mb-12">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-ink-100 shadow-lift">
            <Image
              src={article.featuredImage.url}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
          <ImageCredit image={article.featuredImage} className="px-1" />
          </figure>
        )}

        <div
          className="
            text-[1.0625rem] leading-[1.8] text-ink-800
            [&>p]:mb-6
            [&>h2]:display-sm [&>h2]:text-ink-950 [&>h2]:text-2xl [&>h2]:mt-12 [&>h2]:mb-4
            [&>h3]:font-bold [&>h3]:text-ink-950 [&>h3]:text-xl [&>h3]:mt-10 [&>h3]:mb-3
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
            [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-700
            [&>blockquote]:border-l-4 [&>blockquote]:border-brand-500 [&>blockquote]:pl-5
            [&>blockquote]:italic [&>blockquote]:text-ink-600 [&>blockquote]:my-8
          "
          dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
        />

        {article.areas.length > 0 && (
          <div className="mt-12 pt-8 border-t border-ink-100">
            <p className="eyebrow text-ink-400 mb-3">Areas covered</p>
            <div className="flex flex-wrap gap-2">
              {article.areas.map(({ area }) => (
                <Link
                  key={area.id}
                  href={`/area/${area.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
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
            <p className="eyebrow text-ink-400 mb-3">Tagged</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-3 py-1.5 rounded-full bg-ink-50 text-sm font-medium text-ink-600"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author */}
        <div className="mt-10 rounded-2xl bg-ink-50 border border-ink-100 p-6 flex gap-4">
          <span className="grid place-items-center w-12 h-12 shrink-0 rounded-full bg-brand-500 text-white font-bold">
            {article.author.name.charAt(0)}
          </span>
          <div>
            <p className="eyebrow text-ink-400">Written by</p>
            <p className="mt-1 font-bold text-ink-950">{article.author.name}</p>
            {article.author.bio && (
              <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
                {article.author.bio}
              </p>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-ink-50/70 border-t border-ink-100">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="eyebrow text-brand-600">Keep reading</p>
            <h2 className="display-sm mt-2.5 mb-10 text-ink-950 text-3xl">Related guides</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
