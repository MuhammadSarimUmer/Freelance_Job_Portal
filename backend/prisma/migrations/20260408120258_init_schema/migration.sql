-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'DEPOSITED', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BugSeverity" AS ENUM ('LOW', 'MINOR', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BugStatus" AS ENUM ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Developer" (
    "developerID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "portfolioURL" TEXT,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("developerID")
);

-- CreateTable
CREATE TABLE "Client" (
    "clientID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "companyName" TEXT,
    "billingAddress" TEXT,
    "country" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("clientID")
);

-- CreateTable
CREATE TABLE "TechnologyStack" (
    "techID" TEXT NOT NULL,
    "techName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT,

    CONSTRAINT "TechnologyStack_pkey" PRIMARY KEY ("techID")
);

-- CreateTable
CREATE TABLE "DeveloperTechnology" (
    "developerID" TEXT NOT NULL,
    "techID" TEXT NOT NULL,
    "proficiencyLevel" "ProficiencyLevel" NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DeveloperTechnology_pkey" PRIMARY KEY ("developerID","techID")
);

-- CreateTable
CREATE TABLE "Application" (
    "appID" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "appType" TEXT NOT NULL,
    "description" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentVersion" TEXT NOT NULL DEFAULT '1.0.0',

    CONSTRAINT "Application_pkey" PRIMARY KEY ("appID")
);

-- CreateTable
CREATE TABLE "ProjectContract" (
    "contractID" TEXT NOT NULL,
    "clientID" TEXT NOT NULL,
    "appID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "signedDate" TIMESTAMP(3),

    CONSTRAINT "ProjectContract_pkey" PRIMARY KEY ("contractID")
);

-- CreateTable
CREATE TABLE "ContractAssignment" (
    "assignmentID" TEXT NOT NULL,
    "developerID" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contributionPercentage" DECIMAL(5,2) NOT NULL,
    "paymentShare" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "ContractAssignment_pkey" PRIMARY KEY ("assignmentID")
);

-- CreateTable
CREATE TABLE "ContractTechnology" (
    "contractID" TEXT NOT NULL,
    "techID" TEXT NOT NULL,
    "purpose" TEXT,
    "requiredLevel" "ProficiencyLevel" NOT NULL,

    CONSTRAINT "ContractTechnology_pkey" PRIMARY KEY ("contractID","techID")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "milestoneID" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completeDate" TIMESTAMP(3),
    "milestoneAmount" DECIMAL(10,2) NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("milestoneID")
);

-- CreateTable
CREATE TABLE "PaymentEscrow" (
    "escrowID" TEXT NOT NULL,
    "milestoneID" TEXT NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL,
    "depositDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releaseDate" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionReference" TEXT,

    CONSTRAINT "PaymentEscrow_pkey" PRIMARY KEY ("escrowID")
);

-- CreateTable
CREATE TABLE "BugReport" (
    "bugID" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "BugSeverity" NOT NULL,
    "status" "BugStatus" NOT NULL DEFAULT 'REPORTED',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedDate" TIMESTAMP(3),

    CONSTRAINT "BugReport_pkey" PRIMARY KEY ("bugID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_userID_key" ON "Developer"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userID_key" ON "Client"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "TechnologyStack_techName_key" ON "TechnologyStack"("techName");

-- CreateIndex
CREATE UNIQUE INDEX "ContractAssignment_developerID_contractID_key" ON "ContractAssignment"("developerID", "contractID");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEscrow_milestoneID_key" ON "PaymentEscrow"("milestoneID");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEscrow_transactionReference_key" ON "PaymentEscrow"("transactionReference");

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperTechnology" ADD CONSTRAINT "DeveloperTechnology_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer"("developerID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperTechnology" ADD CONSTRAINT "DeveloperTechnology_techID_fkey" FOREIGN KEY ("techID") REFERENCES "TechnologyStack"("techID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContract" ADD CONSTRAINT "ProjectContract_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "Client"("clientID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContract" ADD CONSTRAINT "ProjectContract_appID_fkey" FOREIGN KEY ("appID") REFERENCES "Application"("appID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAssignment" ADD CONSTRAINT "ContractAssignment_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer"("developerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAssignment" ADD CONSTRAINT "ContractAssignment_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTechnology" ADD CONSTRAINT "ContractTechnology_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTechnology" ADD CONSTRAINT "ContractTechnology_techID_fkey" FOREIGN KEY ("techID") REFERENCES "TechnologyStack"("techID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEscrow" ADD CONSTRAINT "PaymentEscrow_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "Milestone"("milestoneID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_contractID_fkey" FOREIGN KEY ("contractID") REFERENCES "ProjectContract"("contractID") ON DELETE CASCADE ON UPDATE CASCADE;
