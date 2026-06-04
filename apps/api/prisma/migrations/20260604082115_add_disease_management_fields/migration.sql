/*
  Warnings:

  - You are about to drop the column `cure` on the `Disease` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `recoveryPeriod` to the `Disease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Disease` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiseasesSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_diseaseId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "Disease" DROP COLUMN "cure",
ADD COLUMN     "causes" TEXT[],
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "preventionMethods" TEXT[],
ADD COLUMN     "recoveryPeriod" TEXT NOT NULL,
ADD COLUMN     "severity" "DiseasesSeverity" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "treatmentMethods" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "Profile";

-- CreateTable
CREATE TABLE "RelatedDisease" (
    "id" TEXT NOT NULL,
    "diseaseFromId" TEXT NOT NULL,
    "diseaseToId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatedDisease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RelatedDisease_diseaseFromId_diseaseToId_key" ON "RelatedDisease"("diseaseFromId", "diseaseToId");

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedDisease" ADD CONSTRAINT "RelatedDisease_diseaseFromId_fkey" FOREIGN KEY ("diseaseFromId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedDisease" ADD CONSTRAINT "RelatedDisease_diseaseToId_fkey" FOREIGN KEY ("diseaseToId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
