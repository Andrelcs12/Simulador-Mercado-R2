/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `CapexMaster` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `CapexMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CapexMaster" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CapexMaster_slug_key" ON "CapexMaster"("slug");
