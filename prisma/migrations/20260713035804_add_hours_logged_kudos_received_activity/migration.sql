-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'HOURS_LOGGED';
ALTER TYPE "ActivityType" ADD VALUE 'KUDOS_RECEIVED';

-- DropForeignKey
ALTER TABLE "ObjectiveRecordTag" DROP CONSTRAINT "ObjectiveRecordTag_recordId_fkey";

-- DropForeignKey
ALTER TABLE "ObjectiveRecordTag" DROP CONSTRAINT "ObjectiveRecordTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftAssignment" DROP CONSTRAINT "ShiftAssignment_shiftRoleId_fkey";

-- DropIndex
DROP INDEX "Activity_recipientId_createdAt_idx";

-- DropIndex
DROP INDEX "Activity_recipientId_read_idx";

-- DropIndex
DROP INDEX "Kudos_partTimerId_idx";

-- DropIndex
DROP INDEX "ObjectiveRecord_businessId_idx";

-- DropIndex
DROP INDEX "ObjectiveRecord_partTimerId_businessId_idx";

-- AlterTable
ALTER TABLE "ObjectiveRecord" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftRoleId_fkey" FOREIGN KEY ("shiftRoleId") REFERENCES "ShiftRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveRecordTag" ADD CONSTRAINT "ObjectiveRecordTag_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "ObjectiveRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveRecordTag" ADD CONSTRAINT "ObjectiveRecordTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PerformanceTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
