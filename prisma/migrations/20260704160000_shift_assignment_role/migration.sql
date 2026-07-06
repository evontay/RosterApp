ALTER TABLE "ShiftAssignment" ADD COLUMN "shiftRoleId" TEXT REFERENCES "ShiftRole"(id);
