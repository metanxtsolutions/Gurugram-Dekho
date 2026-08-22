/**
 * One-off backfill: derive ArticleArea rows from the text match the area page
 * used before the join table existed, so no existing association is lost.
 *
 * Idempotent, safe to re-run. Run with:
 *   npx dotenv -e .env -- npx tsx prisma/backfill-article-areas.ts
 */
import prisma from '../lib/db';

async function main() {
  const [articles, areas] = await Promise.all([
    prisma.article.findMany({
      select: { id: true, title: true, excerpt: true, seoKeywords: true, content: true },
    }),
    prisma.area.findMany({ select: { id: true, name: true } }),
  ]);

  let created = 0;
  let skipped = 0;

  for (const article of articles) {
    const haystack = [article.title, article.excerpt, article.seoKeywords, article.content]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    for (const area of areas) {
      if (!haystack.includes(area.name.toLowerCase())) continue;

      const existing = await prisma.articleArea.findUnique({
        where: { articleId_areaId: { articleId: article.id, areaId: area.id } },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.articleArea.create({
        data: { articleId: article.id, areaId: area.id },
      });
      created++;
      console.log(`  + ${area.name}  ←  ${article.title.slice(0, 55)}`);
    }
  }

  console.log(`\nBackfill complete: ${created} created, ${skipped} already present.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
