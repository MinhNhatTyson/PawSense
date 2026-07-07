-- CreateEnum
CREATE TYPE "EmergencyUrgency" AS ENUM ('CRITICAL', 'URGENT');

-- AlterEnum
ALTER TYPE "FlagContentType" ADD VALUE 'EMERGENCY_GUIDE';

-- CreateTable
CREATE TABLE "EmergencyGuide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "urgency" "EmergencyUrgency" NOT NULL DEFAULT 'URGENT',
    "summary" TEXT NOT NULL,
    "emergencySymptoms" TEXT[],
    "firstAidSteps" TEXT[],
    "doNots" TEXT[],
    "whenToSeekVet" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "EmergencyGuide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyGuide_title_key" ON "EmergencyGuide"("title");

-- AddForeignKey
ALTER TABLE "EmergencyGuide" ADD CONSTRAINT "EmergencyGuide_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyGuide" ADD CONSTRAINT "EmergencyGuide_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "flag_emergency_guide" FOREIGN KEY ("contentId") REFERENCES "EmergencyGuide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
