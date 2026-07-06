CREATE TYPE "InterestStatus" AS ENUM ('pending', 'confirmed', 'rejected', 'withdrawn');

CREATE TABLE "ShiftInterest" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "shiftRoleId" TEXT,
    "partTimerId" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftInterest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShiftInterest_shiftId_partTimerId_shiftRoleId_key" ON "ShiftInterest"("shiftId", "partTimerId", "shiftRoleId");

ALTER TABLE "ShiftInterest" ADD CONSTRAINT "ShiftInterest_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShiftInterest" ADD CONSTRAINT "ShiftInterest_shiftRoleId_fkey" FOREIGN KEY ("shiftRoleId") REFERENCES "ShiftRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShiftInterest" ADD CONSTRAINT "ShiftInterest_partTimerId_fkey" FOREIGN KEY ("partTimerId") REFERENCES "PartTimer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
