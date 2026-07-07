/*
  Warnings:

  - You are about to drop the column `characteristics` on the `CatBreed` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `CatBreed` table. All the data in the column will be lost.
  - Added the required column `lifespan` to the `CatBreed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `CatBreed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personality` to the `CatBreed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `physicalAppearance` to the `CatBreed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CatBreed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weightRange` to the `CatBreed` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CatBreed" DROP COLUMN "characteristics",
DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "lifespan" TEXT NOT NULL,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "personality" TEXT NOT NULL,
ADD COLUMN     "physicalAppearance" TEXT NOT NULL,
ADD COLUMN     "temperament" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weightRange" TEXT NOT NULL;
