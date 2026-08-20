/**
 * Record the truth about the images already in the database.
 *
 * They are Unsplash files: legally fine to use, but none of them are
 * photographs of Gurugram. They are therefore marked `illustrative`, which
 * makes every place and area currently using one show up in the replacement
 * queue — those slots make a factual claim these photos cannot support.
 *
 *   npx dotenv -e .env -- npx tsx prisma/backfill-image-provenance.ts
 */
import prisma from '../lib/db';

async function main() {
  const images = await prisma.image.findMany({
    select: { id: true, url: true, alt: true },
  });

  let unsplash = 0;
  let other = 0;

  for (const image of images) {
    const isUnsplash = image.url.includes('images.unsplash.com');

    await prisma.image.update({
      where: { id: image.id },
      data: isUnsplash
        ? {
            source: 'stock',
            license: 'unsplash',
            sourceUrl: 'https://unsplash.com',
            licenseUrl: 'https://unsplash.com/license',
            // Honest: these are not photographs of the subject they illustrate.
            depicts: 'illustrative',
            // Usable, but flagged for replacement wherever it claims a place.
            status: 'approved',
            permissionNote:
              'Unsplash License — free for commercial use, no attribution required. Not a photograph of the subject; replace with an authentic image.',
          }
        : { source: 'stock', license: 'unknown', status: 'draft' },
    });

    isUnsplash ? unsplash++ : other++;
  }

  // Anything claiming to be a specific place or area while only illustrative.
  const [placesAffected, areasAffected] = await Promise.all([
    prisma.place.count({ where: { image: { depicts: 'illustrative' } } }),
    prisma.area.count({ where: { image: { depicts: 'illustrative' } } }),
  ]);

  console.log(`Images tagged: ${unsplash} Unsplash, ${other} other`);
  console.log(
    `Needs an authentic photo: ${placesAffected} place(s), ${areasAffected} area(s)`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
