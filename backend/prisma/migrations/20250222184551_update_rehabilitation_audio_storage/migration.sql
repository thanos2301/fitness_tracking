/*
  Warnings:

  - The `audioRecording` column on the `Rehabilitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Rehabilitation" ADD COLUMN     "audioMimeType" TEXT,
DROP COLUMN "audioRecording",
ADD COLUMN     "audioRecording" BYTEA;
