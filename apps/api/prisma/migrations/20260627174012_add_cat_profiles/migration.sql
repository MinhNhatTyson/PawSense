-- CreateEnum
CREATE TYPE "CatGender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "CatProfile" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "CatGender" NOT NULL,
    "birthDate" TIMESTAMP(3),
    "ageYears" INTEGER,
    "ageMonths" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "breed" TEXT,
    "color" TEXT,
    "notes" TEXT,
    "imageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "catProfileId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "dateGiven" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "veterinarian" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CatProfile" ADD CONSTRAINT "CatProfile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_catProfileId_fkey" FOREIGN KEY ("catProfileId") REFERENCES "CatProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
