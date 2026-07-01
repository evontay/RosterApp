-- Add default pay fields to Skill
ALTER TABLE "Skill" ADD COLUMN "defaultPayType" "PayType";
ALTER TABLE "Skill" ADD COLUMN "defaultPayRate" DECIMAL(10,2);

-- Add payType and payRate to ShiftRole (copy from parent Shift)
ALTER TABLE "ShiftRole" ADD COLUMN "payType" "PayType";
ALTER TABLE "ShiftRole" ADD COLUMN "payRate" DECIMAL(10,2);

UPDATE "ShiftRole" sr
SET "payType" = s."payType",
    "payRate" = s."payRate"
FROM "Shift" s
WHERE sr."shiftId" = s."id";

-- Make non-nullable now that data is populated
ALTER TABLE "ShiftRole" ALTER COLUMN "payType" SET NOT NULL;
ALTER TABLE "ShiftRole" ALTER COLUMN "payRate" SET NOT NULL;

-- Remove payType and payRate from Shift
ALTER TABLE "Shift" DROP COLUMN "payType";
ALTER TABLE "Shift" DROP COLUMN "payRate";
