import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId } = await req.json();

  const assignment = await prisma.shiftAssignment.update({
    where: { id: assignmentId },
    data: { paymentStatus: "paid", paidAt: new Date() },
    include: {
      shift: { select: { id: true, title: true, shiftDate: true } },
      partTimer: { select: { userId: true } },
    },
  });

  await createActivity({
    type: "PAID",
    recipientId: assignment.partTimer.userId,
    entityType: "assignment",
    entityId: assignmentId,
    metadata: {
      shiftTitle: assignment.shift.title,
      shiftDate: assignment.shift.shiftDate.toISOString(),
      payAmount: assignment.payAmount ? Number(assignment.payAmount) : null,
    },
  });

  return NextResponse.json(assignment);
}
