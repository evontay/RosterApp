-- Add businessId to PartTimerSkill (nullable first for data migration)
ALTER TABLE "PartTimerSkill" ADD COLUMN "businessId" TEXT;

-- Populate from the earliest active/invited RosterMembership for each part-timer
UPDATE "PartTimerSkill" pts
SET "businessId" = (
  SELECT rm."businessId"
  FROM "RosterMembership" rm
  WHERE rm."partTimerId" = pts."partTimerId"
  ORDER BY rm."invitedAt" ASC
  LIMIT 1
);

-- Drop rows that couldn't be matched to a business (orphaned)
DELETE FROM "PartTimerSkill" WHERE "businessId" IS NULL;

-- Make NOT NULL and add FK
ALTER TABLE "PartTimerSkill" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "PartTimerSkill" ADD CONSTRAINT "PartTimerSkill_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Drop old PK, add new composite PK
ALTER TABLE "PartTimerSkill" DROP CONSTRAINT "PartTimerSkill_pkey";
ALTER TABLE "PartTimerSkill" ADD PRIMARY KEY ("partTimerId", "skillId", "businessId");
