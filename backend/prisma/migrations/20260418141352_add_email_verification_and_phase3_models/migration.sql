-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Message" (
    "messageID" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "senderID" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("messageID")
);

-- CreateTable
CREATE TABLE "Review" (
    "reviewID" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "reviewerID" TEXT NOT NULL,
    "revieweeID" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewID")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "disputeID" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "raisedByID" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("disputeID")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notificationID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationID")
);

-- CreateIndex
CREATE INDEX "Message_contractID_idx" ON "Message"("contractID");

-- CreateIndex
CREATE INDEX "Message_senderID_idx" ON "Message"("senderID");

-- CreateIndex
CREATE UNIQUE INDEX "Review_contractID_key" ON "Review"("contractID");

-- CreateIndex
CREATE INDEX "Review_revieweeID_idx" ON "Review"("revieweeID");

-- CreateIndex
CREATE INDEX "Dispute_contractID_idx" ON "Dispute"("contractID");

-- CreateIndex
CREATE INDEX "Dispute_raisedByID_idx" ON "Dispute"("raisedByID");

-- CreateIndex
CREATE INDEX "Notification_userID_isRead_idx" ON "Notification"("userID", "isRead");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerID_fkey" FOREIGN KEY ("reviewerID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeID_fkey" FOREIGN KEY ("revieweeID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedByID_fkey" FOREIGN KEY ("raisedByID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
