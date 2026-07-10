import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId } = await req.json();

  const assignment = await prisma.shiftAssignment.findFirst({
    where: {
      id: assignmentId,
      shift: { business: { ownerUserId: session.user.id } },
      paymentStatus: "paid",
    },
  });
  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  await prisma.shiftAssignment.update({
    where: { id: assignmentId },
    data: { paymentStatus: "unpaid", paidAt: null },
  });

  return NextResponse.json({ ok: true });
}
