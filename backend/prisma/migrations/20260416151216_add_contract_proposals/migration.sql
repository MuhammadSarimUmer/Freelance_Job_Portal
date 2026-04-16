-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ProposalSource" AS ENUM ('DEVELOPER_PROPOSAL', 'CLIENT_INVITE');

-- CreateTable
CREATE TABLE "ContractProposal" (
    "proposalID" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "developerID" TEXT NOT NULL,
    "source" "ProposalSource" NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "proposedRate" DECIMAL(10,2),
    "role" TEXT,
    "declineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ContractProposal_pkey" PRIMARY KEY ("proposalID")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractProposal_contractID_developerID_key" ON "ContractProposal"("contractID", "developerID");

-- AddForeignKey
ALTER TABLE "ContractProposal" ADD CONSTRAINT "ContractProposal_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer"("developerID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractProposal" ADD CONSTRAINT "ContractProposal_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;
