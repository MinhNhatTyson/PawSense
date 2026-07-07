-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('KITTEN', 'ADULT', 'SENIOR', 'PRESCRIPTION');

-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('DRY', 'WET', 'SEMI_MOIST', 'RAW', 'SUPPLEMENT');

-- CreateTable
CREATE TABLE "CatFood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" "FoodCategory" NOT NULL,
    "foodType" "FoodType" NOT NULL,
    "description" TEXT NOT NULL,
    "ingredients" TEXT[],
    "protein" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "moisture" DOUBLE PRECISION,
    "calories" DOUBLE PRECISION,
    "ageMinMonths" INTEGER,
    "ageMaxMonths" INTEGER,
    "weightRange" TEXT,
    "allergens" TEXT[],
    "prescriptionRequired" BOOLEAN NOT NULL DEFAULT false,
    "vetNotes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodTreatment" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatFood_name_key" ON "CatFood"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FoodTreatment_foodId_treatmentId_key" ON "FoodTreatment"("foodId", "treatmentId");

-- AddForeignKey
ALTER TABLE "FoodTreatment" ADD CONSTRAINT "FoodTreatment_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "CatFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodTreatment" ADD CONSTRAINT "FoodTreatment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
