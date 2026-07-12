CREATE TABLE "Kudos" (
  "id"          TEXT NOT NULL,
  "partTimerId" TEXT NOT NULL,
  "businessId"  TEXT NOT NULL,
  "shiftId"     TEXT NOT NULL,
  "message"     TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Kudos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Kudos_shiftId_partTimerId_key" UNIQUE ("shiftId", "partTimerId")
);

CREATE INDEX "Kudos_partTimerId_idx" ON "Kudos"("partTimerId");
