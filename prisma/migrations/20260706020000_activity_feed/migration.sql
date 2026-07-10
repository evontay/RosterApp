CREATE TYPE "ActivityType" AS ENUM (
  'INTEREST_CONFIRMED',
  'INTEREST_REJECTED',
  'ASSIGNED',
  'SHIFT_CANCELLED',
  'PAID',
  'INTEREST_RECEIVED',
  'INTEREST_WITHDRAWN'
);

CREATE TABLE "Activity" (
  "id"          TEXT NOT NULL,
  "type"        "ActivityType" NOT NULL,
  "recipientId" TEXT NOT NULL,
  "entityType"  TEXT NOT NULL,
  "entityId"    TEXT NOT NULL,
  "metadata"    JSONB,
  "read"        BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Activity_recipientId_read_idx" ON "Activity"("recipientId", "read");
CREATE INDEX "Activity_recipientId_createdAt_idx" ON "Activity"("recipientId", "createdAt" DESC);
