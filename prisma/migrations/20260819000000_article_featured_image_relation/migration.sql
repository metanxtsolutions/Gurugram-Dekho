-- Preserve the 10 existing URLs by renaming the column rather than dropping it.
-- The backfill turns each one into an Image row, after which this column goes.
ALTER TABLE "Article" RENAME COLUMN "featuredImage" TO "featuredImageUrl";

-- Real relation to Image, so every article header carries provenance.
ALTER TABLE "Article" ADD COLUMN "featuredImageId" TEXT;

ALTER TABLE "Article"
  ADD CONSTRAINT "Article_featuredImageId_fkey"
  FOREIGN KEY ("featuredImageId") REFERENCES "Image"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Article_featuredImageId_idx" ON "Article"("featuredImageId");
