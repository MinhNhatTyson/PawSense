-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "FlagContentType" AS ENUM ('DISEASE', 'MEDICINE');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "Disease" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ContentFlag" (
    "id" TEXT NOT NULL,
    "contentType" "FlagContentType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedById" TEXT,
    "resolverNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentFlag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Disease" ADD CONSTRAINT "Disease_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disease" ADD CONSTRAINT "Disease_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "ContentFlag_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "ContentFlag_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "flag_disease" FOREIGN KEY ("contentId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "flag_medicine" FOREIGN KEY ("contentId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
