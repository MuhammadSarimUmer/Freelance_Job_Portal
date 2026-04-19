/*
  Warnings:

  - A unique constraint covering the columns `[contractID,reviewerID,revieweeID]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MilestoneScope" AS ENUM ('INDIVIDUAL', 'SHARED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'RELEASED', 'REFUNDED');

-- DropIndex
DROP INDEX "Review_contractID_key";

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "scope" "MilestoneScope" NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateTable
CREATE TABLE "MilestoneAssignment" (
    "milestoneID" TEXT NOT NULL,
    "developerID" TEXT NOT NULL,

    CONSTRAINT "MilestoneAssignment_pkey" PRIMARY KEY ("milestoneID","developerID")
);

-- CreateTable
CREATE TABLE "PaymentPayout" (
    "payoutID" TEXT NOT NULL,
    "escrowID" TEXT NOT NULL,
    "developerID" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sharePercent" DECIMAL(5,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'RELEASED',
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentPayout_pkey" PRIMARY KEY ("payoutID")
);

-- CreateIndex
CREATE INDEX "PaymentPayout_developerID_idx" ON "PaymentPayout"("developerID");

-- CreateIndex
CREATE INDEX "PaymentPayout_escrowID_idx" ON "PaymentPayout"("escrowID");

-- CreateIndex
CREATE UNIQUE INDEX "Review_contractID_reviewerID_revieweeID_key" ON "Review"("contractID", "reviewerID", "revieweeID");

-- AddForeignKey
ALTER TABLE "MilestoneAssignment" ADD CONSTRAINT "MilestoneAssignment_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "Milestone"("milestoneID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneAssignment" ADD CONSTRAINT "MilestoneAssignment_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer"("developerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPayout" ADD CONSTRAINT "PaymentPayout_escrowID_fkey" FOREIGN KEY ("escrowID") REFERENCES "PaymentEscrow"("escrowID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPayout" ADD CONSTRAINT "PaymentPayout_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer"("developerID") ON DELETE RESTRICT ON UPDATE CASCADE;
