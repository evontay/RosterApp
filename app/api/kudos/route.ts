import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { shiftId, partTimerId, message } = await req.json();
  const trimmed = message?.trim();
  if (!shiftId || !partTimerId || !trimmed) {
    return NextResponse.json({ error: "shiftId, partTimerId, message required" }, { status: 400 });
  }

  // Verify the shift belongs to this business
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, businessId: business.id },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  // Fetch partTimer userId for activity notification
  const partTimer = await prisma.partTimer.findUnique({
    where: { id: partTimerId },
    select: { userId: true },
  });
  if (!partTimer) return NextResponse.json({ error: "Part-timer not found" }, { status: 404 });

  // Upsert — one kudos per employee per shift
  const kudos = await prisma.kudos.upsert({
    where: { shiftId_partTimerId: { shiftId, partTimerId } },
    create: { shiftId, partTimerId, businessId: business.id, message: trimmed },
    update: { message: trimmed },
  });

  await prisma.activity.create({
    data: {
      type: "KUDOS_RECEIVED",
      recipientId: partTimer.userId,
      entityType: "shift",
      entityId: shiftId,
      metadata: {
        shiftTitle: shift.title,
        shiftDate: shift.shiftDate,
        message: trimmed,
      },
    },
  });

  return NextResponse.json(kudos);
}
