CREATE TYPE "Attendance" AS ENUM ('attended', 'late', 'no_show');
CREATE TYPE "QualityFlag" AS ENUM ('good', 'issues');

CREATE TABLE "PerformanceTag" (
  "id"         TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "label"      TEXT NOT NULL,
  "archived"   BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "PerformanceTag_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PerformanceTag_businessId_label_key" UNIQUE ("businessId", "label")
);

CREATE TABLE "ObjectiveRecord" (
  "id"          TEXT NOT NULL,
  "shiftId"     TEXT NOT NULL,
  "partTimerId" TEXT NOT NULL,
  "businessId"  TEXT NOT NULL,
  "attendance"  "Attendance" NOT NULL,
  "qualityFlag" "QualityFlag",
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ObjectiveRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ObjectiveRecord_shiftId_partTimerId_key" UNIQUE ("shiftId", "partTimerId")
);

CREATE TABLE "ObjectiveRecordTag" (
  "recordId" TEXT NOT NULL,
  "tagId"    TEXT NOT NULL,
  CONSTRAINT "ObjectiveRecordTag_pkey" PRIMARY KEY ("recordId", "tagId"),
  CONSTRAINT "ObjectiveRecordTag_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "ObjectiveRecord"("id") ON DELETE CASCADE,
  CONSTRAINT "ObjectiveRecordTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PerformanceTag"("id")
);

CREATE INDEX "ObjectiveRecord_partTimerId_businessId_idx" ON "ObjectiveRecord"("partTimerId", "businessId");
CREATE INDEX "ObjectiveRecord_businessId_idx" ON "ObjectiveRecord"("businessId");
