import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createActivities } from "@/lib/activity";

const VALID_TRANSITIONS: Record<string, string[]> = {
  open:      ["completed", "cancelled"],
  filled:    ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shiftId, status } = await req.json();

  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, business: { ownerUserId: session.user.id } },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  if (!VALID_TRANSITIONS[shift.status]?.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${shift.status} to ${status}` },
      { status: 400 }
    );
  }

  // Prevent marking logged before the shift date
  if (status === "completed") {
    const shiftDay = new Date(shift.shiftDate);
    shiftDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (shiftDay > today) {
      return NextResponse.json(
        { error: "Cannot mark a shift as logged before it has taken place" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.shift.update({
    where: { id: shiftId },
    data: { status, ...(status === "cancelled" && { archived: true }) },
  });

  // Notify all assigned employees when shift is cancelled
  if (status === "cancelled") {
    const assignments = await prisma.shiftAssignment.findMany({
      where: { shiftId, status: { not: "cancelled" } },
      include: { partTimer: { select: { userId: true } } },
    });
    await createActivities(
      assignments.map((a) => ({
        type: "SHIFT_CANCELLED" as const,
        recipientId: a.partTimer.userId,
        entityType: "shift",
        entityId: shiftId,
        metadata: {
          shiftTitle: shift.title,
          shiftDate: shift.shiftDate.toISOString(),
        },
      }))
    );
  }

  return NextResponse.json(updated);
}
