CREATE TYPE "AvailabilityPreference" AS ENUM ('morning', 'afternoon', 'flexible');
ALTER TABLE "Availability" ADD COLUMN "preference" "AvailabilityPreference" NOT NULL DEFAULT 'flexible';
ALTER TABLE "Availability" DROP COLUMN "startTime";
ALTER TABLE "Availability" DROP COLUMN "endTime";
