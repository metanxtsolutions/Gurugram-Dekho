-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "credit" TEXT,
ADD COLUMN     "depicts" TEXT NOT NULL DEFAULT 'illustrative',
ADD COLUMN     "license" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "licenseUrl" TEXT,
ADD COLUMN     "permissionNote" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'stock',
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- CreateIndex
CREATE INDEX "Image_status_idx" ON "Image"("status");

-- CreateIndex
CREATE INDEX "Image_source_idx" ON "Image"("source");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
