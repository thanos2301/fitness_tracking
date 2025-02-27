-- CreateTable
CREATE TABLE "Rehabilitation" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "audioRecording" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Rehabilitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rehabilitation_userId_key" ON "Rehabilitation"("userId");

-- AddForeignKey
ALTER TABLE "Rehabilitation" ADD CONSTRAINT "Rehabilitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
