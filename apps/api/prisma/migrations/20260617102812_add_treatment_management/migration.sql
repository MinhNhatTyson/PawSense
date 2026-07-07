-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contraindications" TEXT[],
    "vetNotes" TEXT,
    "estimatedDuration" TEXT,
    "estimatedCost" TEXT,
    "successRate" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentStep" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreatmentStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseTreatment" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Treatment_name_key" ON "Treatment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseTreatment_diseaseId_treatmentId_key" ON "DiseaseTreatment"("diseaseId", "treatmentId");

-- AddForeignKey
ALTER TABLE "TreatmentStep" ADD CONSTRAINT "TreatmentStep_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
