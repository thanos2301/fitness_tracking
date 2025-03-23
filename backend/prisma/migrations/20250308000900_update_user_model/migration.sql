/*
  Warnings:

  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "RehabilitationAssessment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "injuryType" TEXT NOT NULL,
    "assessmentData" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RehabilitationAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RehabilitationAssessment_userId_idx" ON "RehabilitationAssessment"("userId");

-- AddForeignKey
ALTER TABLE "RehabilitationAssessment" ADD CONSTRAINT "RehabilitationAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
