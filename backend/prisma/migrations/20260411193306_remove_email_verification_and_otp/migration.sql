/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationTokenExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PasswordResetOtp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasswordResetOtp" DROP CONSTRAINT "PasswordResetOtp_userID_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerificationTokenExpires",
DROP COLUMN "emailVerified",
DROP COLUMN "emailVerifiedAt";

-- DropTable
DROP TABLE "PasswordResetOtp";
