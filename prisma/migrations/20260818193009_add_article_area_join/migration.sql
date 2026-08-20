-- CreateTable
CREATE TABLE "ArticleArea" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleArea_articleId_idx" ON "ArticleArea"("articleId");

-- CreateIndex
CREATE INDEX "ArticleArea_areaId_idx" ON "ArticleArea"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleArea_articleId_areaId_key" ON "ArticleArea"("articleId", "areaId");

-- AddForeignKey
ALTER TABLE "ArticleArea" ADD CONSTRAINT "ArticleArea_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleArea" ADD CONSTRAINT "ArticleArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
