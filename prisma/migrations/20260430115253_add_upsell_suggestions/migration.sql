-- CreateTable
CREATE TABLE "UpsellSuggestion" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "itemIds" TEXT[],
    "comboPrice" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "UpsellSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UpsellSuggestion_restaurantId_status_idx" ON "UpsellSuggestion"("restaurantId", "status");

-- AddForeignKey
ALTER TABLE "UpsellSuggestion" ADD CONSTRAINT "UpsellSuggestion_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
