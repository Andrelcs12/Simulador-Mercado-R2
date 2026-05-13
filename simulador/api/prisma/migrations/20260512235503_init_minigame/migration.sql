/*
  Warnings:

  - You are about to drop the column `roundNumber` on the `Configuration` table. All the data in the column will be lost.
  - You are about to drop the column `roundNumber` on the `RoundResult` table. All the data in the column will be lost.
  - You are about to drop the `DemoFinanceiro` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storeId,roundId]` on the table `Configuration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,roundId]` on the table `RoundResult` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playerId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roundId` to the `Configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `Configuration` table without a default value. This is not possible if the table is not empty.
  - Made the column `totalSpent` on table `Configuration` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interestPaid` on table `Configuration` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `roundId` to the `RoundResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `RoundResult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('LOBBY', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "GameRoundStatus" AS ENUM ('OPEN', 'CLOSED');

-- DropForeignKey
ALTER TABLE "Configuration" DROP CONSTRAINT "Configuration_storeId_fkey";

-- DropForeignKey
ALTER TABLE "RoundResult" DROP CONSTRAINT "RoundResult_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StockInput" DROP CONSTRAINT "StockInput_configId_fkey";

-- DropForeignKey
ALTER TABLE "StoreCapex" DROP CONSTRAINT "StoreCapex_configId_fkey";

-- AlterTable
ALTER TABLE "Configuration" DROP COLUMN "roundNumber",
ADD COLUMN     "roundId" TEXT NOT NULL,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ALTER COLUMN "totalSpent" SET NOT NULL,
ALTER COLUMN "totalSpent" SET DEFAULT 0,
ALTER COLUMN "interestPaid" SET NOT NULL,
ALTER COLUMN "interestPaid" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "RoundResult" DROP COLUMN "roundNumber",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "roundId" TEXT NOT NULL,
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "playerId" TEXT;

-- DropTable
DROP TABLE "DemoFinanceiro";

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "GameSessionStatus" NOT NULL DEFAULT 'LOBBY',
    "totalRounds" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRound" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "status" "GameRoundStatus" NOT NULL DEFAULT 'OPEN',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player',
    "socketId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "totalProfit" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_code_key" ON "GameSession"("code");

-- CreateIndex
CREATE INDEX "GameRound_sessionId_status_idx" ON "GameRound"("sessionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GameRound_sessionId_roundNumber_key" ON "GameRound"("sessionId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Score_playerId_round_key" ON "Score"("playerId", "round");

-- CreateIndex
CREATE INDEX "SessionResult_sessionId_idx" ON "SessionResult"("sessionId");

-- CreateIndex
CREATE INDEX "Configuration_sessionId_roundId_idx" ON "Configuration"("sessionId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_storeId_roundId_key" ON "Configuration"("storeId", "roundId");

-- CreateIndex
CREATE INDEX "RoundResult_sessionId_roundId_idx" ON "RoundResult"("sessionId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundResult_storeId_roundId_key" ON "RoundResult"("storeId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_playerId_key" ON "Store"("playerId");

-- AddForeignKey
ALTER TABLE "GameRound" ADD CONSTRAINT "GameRound_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configuration" ADD CONSTRAINT "Configuration_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configuration" ADD CONSTRAINT "Configuration_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configuration" ADD CONSTRAINT "Configuration_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GameRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInput" ADD CONSTRAINT "StockInput_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Configuration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCapex" ADD CONSTRAINT "StoreCapex_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Configuration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GameRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionResult" ADD CONSTRAINT "SessionResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionResult" ADD CONSTRAINT "SessionResult_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
