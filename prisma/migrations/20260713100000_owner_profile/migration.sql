-- AlterTable: add owner profile fields to Business
ALTER TABLE "Business" ADD COLUMN "ownerName" TEXT;
ALTER TABLE "Business" ADD COLUMN "ownerPhone" TEXT;
ALTER TABLE "Business" ADD COLUMN "avatarEmoji" TEXT;
ALTER TABLE "Business" ADD COLUMN "avatarColor" TEXT;
ALTER TABLE "Business" ADD COLUMN "businessAddress" TEXT;
