import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId, hours, payType, payRate } = await req.json();

  const payAmount =
    payType === "hourly"
      ? parseFloat(hours) * parseFloat(payRate)
      : parseFloat(payRate);

  const assignment = await prisma.shiftAssignment.update({
    where: { id: assignmentId },
    data: { hoursLogged: hours, payAmount, status: "completed" },
    include: {
      partTimer: { select: { userId: true } },
      shift: { select: { id: true, title: true, shiftDate: true } },
    },
  });

  await prisma.activity.create({
    data: {
      type: "HOURS_LOGGED",
      recipientId: assignment.partTimer.userId,
      entityType: "shift",
      entityId: assignment.shift.id,
      metadata: {
        shiftTitle: assignment.shift.title,
        shiftDate: assignment.shift.shiftDate,
        hoursLogged: hours,
        payAmount,
      },
    },
  });

  return NextResponse.json(assignment);
}
