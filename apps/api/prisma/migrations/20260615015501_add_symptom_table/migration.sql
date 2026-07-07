-- CreateEnum
CREATE TYPE "SymptomCommonality" AS ENUM ('RARE', 'COMMON', 'VERY_COMMON');

-- CreateEnum
CREATE TYPE "SymptomOnsetSpeed" AS ENUM ('ACUTE', 'SUBACUTE', 'CHRONIC');

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedBodyArea" TEXT,
    "commonality" "SymptomCommonality" NOT NULL DEFAULT 'COMMON',
    "onsetSpeed" "SymptomOnsetSpeed" NOT NULL DEFAULT 'ACUTE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseSymptom" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Symptom_name_key" ON "Symptom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseSymptom_diseaseId_symptomId_key" ON "DiseaseSymptom"("diseaseId", "symptomId");

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
