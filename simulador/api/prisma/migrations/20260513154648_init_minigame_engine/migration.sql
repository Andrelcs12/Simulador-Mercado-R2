/*
  Warnings:

  - You are about to drop the column `baseLicense` on the `CapexMaster` table. All the data in the column will be lost.
  - You are about to drop the column `upgradeImpact` on the `CapexMaster` table. All the data in the column will be lost.
  - You are about to drop the column `marketStock` on the `CategoryMaster` table. All the data in the column will be lost.
  - You are about to drop the column `finalCSAT` on the `Configuration` table. All the data in the column will be lost.
  - You are about to drop the column `finalSLA` on the `Configuration` table. All the data in the column will be lost.
  - You are about to drop the column `interestPaid` on the `Configuration` table. All the data in the column will be lost.
  - You are about to drop the column `totalSpent` on the `Configuration` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `storeName` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `marketShare` on the `RoundResult` table. All the data in the column will be lost.
  - You are about to drop the column `remainingStock` on the `RoundResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalProfit` on the `SessionResult` table. All the data in the column will be lost.
  - You are about to drop the column `appliedMargin` on the `StockInput` table. All the data in the column will be lost.
  - You are about to drop the column `configId` on the `StockInput` table. All the data in the column will be lost.
  - You are about to drop the column `playerId` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `configId` on the `StoreCapex` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `StoreCapex` table. All the data in the column will be lost.
  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `totalMarketStock` to the `CategoryMaster` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `sessionId` on table `Player` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `capexCosts` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `csat` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customersReceived` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestCosts` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licensingCosts` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingStockValue` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sla` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stockBreakLoss` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalExpenses` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTaxes` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalCash` to the `SessionResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalEbitda` to the `SessionResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalEbitdaMargin` to the `SessionResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalExpenses` to the `SessionResult` table without a default value. This is not possible if the table is not empty.
  - Made the column `position` on table `SessionResult` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `commercialMargin` to the `StockInput` table without a default value. This is not possible if the table is not empty.
  - Added the required column `configurationId` to the `StockInput` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedSellPrice` to the `StockInput` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `configurationId` to the `StoreCapex` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('STORE_MANAGER', 'SERVICE_MANAGER', 'SUPPLY_MANAGER', 'COMMERCIAL_MANAGER', 'OPERATION_MANAGER');

-- AlterEnum
ALTER TYPE "GameRoundStatus" ADD VALUE 'PROCESSING';

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_playerId_fkey";

-- DropForeignKey
ALTER TABLE "StockInput" DROP CONSTRAINT "StockInput_configId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_playerId_fkey";

-- DropForeignKey
ALTER TABLE "StoreCapex" DROP CONSTRAINT "StoreCapex_configId_fkey";

-- DropIndex
DROP INDEX "Configuration_sessionId_roundId_idx";

-- DropIndex
DROP INDEX "GameRound_sessionId_status_idx";

-- DropIndex
DROP INDEX "GameSession_status_idx";

-- DropIndex
DROP INDEX "Player_sessionId_idx";

-- DropIndex
DROP INDEX "RoundResult_sessionId_roundId_idx";

-- DropIndex
DROP INDEX "SessionResult_sessionId_idx";

-- DropIndex
DROP INDEX "StockInput_configId_idx";

-- DropIndex
DROP INDEX "Store_playerId_key";

-- DropIndex
DROP INDEX "StoreCapex_configId_idx";

-- AlterTable
ALTER TABLE "CapexMaster" DROP COLUMN "baseLicense",
DROP COLUMN "upgradeImpact",
ADD COLUMN     "csatImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "productivityImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "recurringLicenseCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "slaImpact" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CategoryMaster" DROP COLUMN "marketStock",
ADD COLUMN     "totalMarketStock" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Configuration" DROP COLUMN "finalCSAT",
DROP COLUMN "finalSLA",
DROP COLUMN "interestPaid",
DROP COLUMN "totalSpent",
ADD COLUMN     "calculatedCSAT" DOUBLE PRECISION,
ADD COLUMN     "calculatedSLA" DOUBLE PRECISION,
ADD COLUMN     "totalInvestment" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "operatorsQty" DROP DEFAULT,
ALTER COLUMN "serviceOperatorsQty" DROP DEFAULT,
ALTER COLUMN "quizScore" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GameSession" ALTER COLUMN "totalRounds" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "isActive",
DROP COLUMN "storeName",
DROP COLUMN "updatedAt",
ADD COLUMN     "storeId" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "PlayerRole" NOT NULL,
ALTER COLUMN "sessionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RoundResult" DROP COLUMN "marketShare",
DROP COLUMN "remainingStock",
ADD COLUMN     "capexCosts" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "csat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "customersReceived" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "interestCosts" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "licensingCosts" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "remainingStockValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sla" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stockBreakLoss" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalExpenses" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalTaxes" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "SessionResult" DROP COLUMN "totalProfit",
ADD COLUMN     "finalCash" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalEbitda" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalEbitdaMargin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalExpenses" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "position" SET NOT NULL;

-- AlterTable
ALTER TABLE "StockInput" DROP COLUMN "appliedMargin",
DROP COLUMN "configId",
ADD COLUMN     "commercialMargin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "configurationId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expectedSellPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "playerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "accumulatedEbitda" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "accumulatedProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "accumulatedRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currentCSAT" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currentSLA" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StoreCapex" DROP COLUMN "configId",
DROP COLUMN "isApproved",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "configurationId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Score";

-- CreateTable
CREATE TABLE "RoundRanking" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "priceScore" DOUBLE PRECISION NOT NULL,
    "availabilityScore" DOUBLE PRECISION NOT NULL,
    "csatScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "demandShare" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoundRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoundRanking_sessionId_roundId_idx" ON "RoundRanking"("sessionId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundRanking_roundId_storeId_key" ON "RoundRanking"("roundId", "storeId");

-- CreateIndex
CREATE INDEX "Store_sessionId_idx" ON "Store"("sessionId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInput" ADD CONSTRAINT "StockInput_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCapex" ADD CONSTRAINT "StoreCapex_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundRanking" ADD CONSTRAINT "RoundRanking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundRanking" ADD CONSTRAINT "RoundRanking_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GameRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundRanking" ADD CONSTRAINT "RoundRanking_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
