-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "alwaysOpen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OpeningHour" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "opensAt" INTEGER NOT NULL,
    "closesAt" INTEGER NOT NULL,

    CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpeningHour_placeId_idx" ON "OpeningHour"("placeId");

-- CreateIndex
CREATE INDEX "OpeningHour_placeId_day_idx" ON "OpeningHour"("placeId", "day");

-- AddForeignKey
ALTER TABLE "OpeningHour" ADD CONSTRAINT "OpeningHour_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
