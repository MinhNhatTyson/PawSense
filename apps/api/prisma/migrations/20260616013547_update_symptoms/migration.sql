/*
  Warnings:

  - You are about to drop the column `affectedBodyArea` on the `Symptom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Symptom" DROP COLUMN "affectedBodyArea",
ADD COLUMN     "affectedBodyAreas" TEXT[];
