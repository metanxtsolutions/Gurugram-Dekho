-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "tagline" TEXT;

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readMins" INTEGER;

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_status_featured_idx" ON "Article"("status", "featured");
