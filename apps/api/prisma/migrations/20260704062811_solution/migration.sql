/*
  Warnings:

  - You are about to drop the column `breed` on the `CatProfile` table. All the data in the column will be lost.
  - You are about to drop the `FoodTreatment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FoodTreatment" DROP CONSTRAINT "FoodTreatment_foodId_fkey";

-- DropForeignKey
ALTER TABLE "FoodTreatment" DROP CONSTRAINT "FoodTreatment_treatmentId_fkey";

-- AlterTable
ALTER TABLE "CatProfile" DROP COLUMN "breed",
ADD COLUMN     "breedId" TEXT;

-- DropTable
DROP TABLE "FoodTreatment";

-- CreateTable
CREATE TABLE "DiseaseFood" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatDiagnosis" (
    "id" TEXT NOT NULL,
    "catProfileId" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "diagnosedById" TEXT NOT NULL,
    "diagnosedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseFood_diseaseId_foodId_key" ON "DiseaseFood"("diseaseId", "foodId");

-- CreateIndex
CREATE UNIQUE INDEX "CatDiagnosis_catProfileId_diseaseId_key" ON "CatDiagnosis"("catProfileId", "diseaseId");

-- AddForeignKey
ALTER TABLE "DiseaseFood" ADD CONSTRAINT "DiseaseFood_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseFood" ADD CONSTRAINT "DiseaseFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "CatFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatProfile" ADD CONSTRAINT "CatProfile_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "CatBreed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatDiagnosis" ADD CONSTRAINT "CatDiagnosis_catProfileId_fkey" FOREIGN KEY ("catProfileId") REFERENCES "CatProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatDiagnosis" ADD CONSTRAINT "CatDiagnosis_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatDiagnosis" ADD CONSTRAINT "CatDiagnosis_diagnosedById_fkey" FOREIGN KEY ("diagnosedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
