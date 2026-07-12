import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — create or update an ObjectiveRecord for an assignment
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { shiftId, partTimerId, attendance, qualityFlag, tagIds, comment } = await req.json();
  if (!shiftId || !partTimerId || !attendance) {
    return NextResponse.json({ error: "shiftId, partTimerId, attendance required" }, { status: 400 });
  }

  // Verify the shift belongs to this business and is completed
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, businessId: business.id, status: "completed" },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found or not completed" }, { status: 404 });

  // Upsert the record
  const existing = await prisma.objectiveRecord.findUnique({
    where: { shiftId_partTimerId: { shiftId, partTimerId } },
  });

  let record;
  if (existing) {
    // Update record and replace tags
    await prisma.objectiveRecordTag.deleteMany({ where: { recordId: existing.id } });
    record = await prisma.objectiveRecord.update({
      where: { id: existing.id },
      data: {
        attendance,
        qualityFlag: qualityFlag ?? null,
        comment: comment?.trim() || null,
        updatedAt: new Date(),
        tags: tagIds?.length > 0
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
    });
  } else {
    record = await prisma.objectiveRecord.create({
      data: {
        shiftId,
        partTimerId,
        businessId: business.id,
        attendance,
        qualityFlag: qualityFlag ?? null,
        comment: comment?.trim() || null,
        tags: tagIds?.length > 0
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
    });
  }

  return NextResponse.json(record);
}
