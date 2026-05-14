/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,roundId,storeId]` on the table `RoundRanking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `marketShare` to the `RoundRanking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundNumber` to the `RoundRanking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalMarketShare` to the `SessionResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RoundRanking_roundId_storeId_key";

-- AlterTable
ALTER TABLE "RoundRanking" ADD COLUMN     "marketShare" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "roundNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RoundResult" ADD COLUMN     "marketShare" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SessionResult" ADD COLUMN     "finalMarketShare" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "RoundRanking_sessionId_roundNumber_idx" ON "RoundRanking"("sessionId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RoundRanking_sessionId_roundId_storeId_key" ON "RoundRanking"("sessionId", "roundId", "storeId");

-- CreateIndex
CREATE INDEX "RoundResult_sessionId_roundId_idx" ON "RoundResult"("sessionId", "roundId");

-- CreateIndex
CREATE INDEX "SessionResult_sessionId_idx" ON "SessionResult"("sessionId");
