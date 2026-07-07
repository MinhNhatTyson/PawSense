-- CreateTable
CREATE TABLE "HealthNote" (
    "id" TEXT NOT NULL,
    "catProfileId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "noteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatTreatmentRecord" (
    "id" TEXT NOT NULL,
    "catProfileId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "administeredById" TEXT NOT NULL,
    "administeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatTreatmentRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HealthNote" ADD CONSTRAINT "HealthNote_catProfileId_fkey" FOREIGN KEY ("catProfileId") REFERENCES "CatProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatTreatmentRecord" ADD CONSTRAINT "CatTreatmentRecord_catProfileId_fkey" FOREIGN KEY ("catProfileId") REFERENCES "CatProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatTreatmentRecord" ADD CONSTRAINT "CatTreatmentRecord_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatTreatmentRecord" ADD CONSTRAINT "CatTreatmentRecord_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
