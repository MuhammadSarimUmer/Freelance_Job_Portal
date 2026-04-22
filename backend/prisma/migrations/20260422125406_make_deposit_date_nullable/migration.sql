-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "bio" TEXT;

-- AlterTable
ALTER TABLE "PaymentEscrow" ALTER COLUMN "depositDate" DROP NOT NULL,
ALTER COLUMN "depositDate" DROP DEFAULT;
