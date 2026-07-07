/*
  Warnings:

  - You are about to drop the column `diseaseId` on the `Medicine` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usageInstructions` to the `Medicine` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_diseaseId_fkey";

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "diseaseId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "sideEffects" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usageInstructions" TEXT NOT NULL,
ADD COLUMN     "warnings" TEXT[];

-- CreateTable
CREATE TABLE "DiseaseMedicine" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseMedicine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseMedicine_diseaseId_medicineId_key" ON "DiseaseMedicine"("diseaseId", "medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_name_key" ON "Medicine"("name");

-- AddForeignKey
ALTER TABLE "DiseaseMedicine" ADD CONSTRAINT "DiseaseMedicine_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseMedicine" ADD CONSTRAINT "DiseaseMedicine_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
