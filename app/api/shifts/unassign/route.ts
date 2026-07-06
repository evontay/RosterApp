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
    where: { id: assignmentId, shift: { business: { ownerUserId: session.user.id } } },
  });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.shiftAssignment.update({
    where: { id: assignmentId },
    data: { status: "cancelled" },
  });

  // Revert to "open" if a slot just became empty
  const shift = await prisma.shift.findUnique({
    where: { id: assignment.shiftId },
    select: { status: true },
  });
  if (shift?.status === "filled") {
    await prisma.shift.update({ where: { id: assignment.shiftId }, data: { status: "open" } });
  }

  return NextResponse.json({ ok: true });
}
