-- Create ShiftRole table
CREATE TABLE "ShiftRole" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ShiftRole_pkey" PRIMARY KEY ("id")
);

-- Migrate existing shift skillId data into ShiftRole
INSERT INTO "ShiftRole" ("id", "shiftId", "skillId", "count")
SELECT md5(random()::text || "id"), "id", "skillId", 1
FROM "Shift"
WHERE "skillId" IS NOT NULL;

-- Add foreign key constraints
ALTER TABLE "ShiftRole" ADD CONSTRAINT "ShiftRole_shiftId_fkey"
    FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShiftRole" ADD CONSTRAINT "ShiftRole_skillId_fkey"
    FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old skillId column from Shift
ALTER TABLE "Shift" DROP COLUMN "skillId";
