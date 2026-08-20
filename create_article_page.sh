#!/bin/bash
cat > "./app/(routes)/article/[slug]/page.tsx" << 'ARTICLE'
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { formatDate } from '@/lib/utils';

interface ArticlePageProps {
  params: { slug: string };
}

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      featuredImage: true,
      images: { include: { image: true }, orderBy: { order: 'asc' } },
    },
  });
}

async function getRelatedArticles(articleId: string, categoryIds: string[]) {
  if (categoryIds.length === 0) return [];
  return prisma.article.findMany({
    where: {
      id: { not: articleId },
      status: 'published',
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    include: {
      author: { select: { name: true } },
      featuredImage: true,
      categories: { include: { category: true } },
    },
    take: 3,
  });
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Article not found' };

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    keywords: article.seoKeywords,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.seoDescription,
      images: article.ogImage || article.featuredImage?.url,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author.name,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const categoryIds = article.categories.map((ac) => ac.categoryId);
  const relatedArticles = await getRelatedArticles(article.id, categoryIds);

  const articleSchema = generateArticleSchema({
    title: article.title,
    description: article.excerpt || article.seoDescription,
    image: article.ogImage || article.featuredImage?.url,
    publishedAt: article.publishedAt,
    modifiedAt: article.updatedAt,
    author: article.author.name,
    url: `https://gurugramdekho.com/article/${article.slug}`,
  });

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    ...(article.categories[0]
      ? [{ name: article.categories[0].category.name, href: `/category/${article.categories[0].category.slug}` }]
      : []),
    { name: article.title, href: `/article/${article.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Breadcrumb items={breadcrumbs} />

      <article className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          {article.categories[0] && (
            <Link href={`/category/${article.categories[0].category.slug}`} className="inline-block text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded mb-4">
              {article.categories[0].category.name}
            </Link>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 text-sm border-b pb-4">
            <div>
              <p className="font-semibold text-gray-900">{article.author.name}</p>
              <p>{article.publishedAt && formatDate(article.publishedAt)}</p>
            </div>
          </div>
        </div>

        {article.featuredImage && (
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
            <Image src={article.featuredImage.url} alt={article.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="prose max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 border-t pt-4">
            {article.tags.map((at) => (
              <Link key={at.tagId} href={`/tag/${at.tag.slug}`} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded">
                #{at.tag.name}
              </Link>
            ))}
          </div>
        )}
      </article>

      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <ArticleCard key={related.id} {...related} category={related.categories[0]?.category} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
ARTICLE
