-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "canonicalUrl" TEXT;

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "specialties" TEXT;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
