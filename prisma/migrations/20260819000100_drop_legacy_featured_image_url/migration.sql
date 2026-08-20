-- Every article now points at an Image row; the raw URL column is redundant.
ALTER TABLE "Article" DROP COLUMN "featuredImageUrl";
