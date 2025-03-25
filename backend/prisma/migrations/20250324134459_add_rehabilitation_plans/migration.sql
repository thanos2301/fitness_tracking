-- CreateTable
CREATE TABLE "rehabilitation_plans" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exercise" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "painLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rehabilitation_plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rehabilitation_plans" ADD CONSTRAINT "rehabilitation_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
