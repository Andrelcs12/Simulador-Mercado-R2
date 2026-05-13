/*
  Warnings:

  - You are about to drop the column `initialCash` on the `Store` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId,storeId]` on the table `SessionResult` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `finalCash` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Made the column `playerId` on table `Store` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "GameRoundStatus" ADD VALUE 'PROCESSED';

-- AlterTable
ALTER TABLE "Configuration" ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GameRound" ALTER COLUMN "status" SET DEFAULT 'CLOSED',
ALTER COLUMN "startsAt" DROP NOT NULL,
ALTER COLUMN "endsAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RoundResult" ADD COLUMN     "finalCash" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "initialCash",
ADD COLUMN     "cashBalance" DOUBLE PRECISION NOT NULL DEFAULT 700000,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "playerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "GameSession_status_idx" ON "GameSession"("status");

-- CreateIndex
CREATE INDEX "Player_sessionId_idx" ON "Player"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionResult_sessionId_storeId_key" ON "SessionResult"("sessionId", "storeId");

-- CreateIndex
CREATE INDEX "StockInput_configId_idx" ON "StockInput"("configId");

-- CreateIndex
CREATE INDEX "StoreCapex_configId_idx" ON "StoreCapex"("configId");
