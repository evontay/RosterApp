import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Reverts a completed shift back to filled or open based on slot count
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shiftId } = await req.json();

  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, business: { ownerUserId: session.user.id }, status: "completed" },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found or not in completed state" }, { status: 404 });

  // Recalculate status from slot fill state
  const roles = await prisma.shiftRole.findMany({ where: { shiftId }, select: { id: true, count: true } });
  const totalSlots = roles.reduce((sum, r) => sum + r.count, 0);
  const filledSlots = await prisma.shiftAssignment.count({
    where: { shiftId, shiftRoleId: { not: null }, status: { not: "cancelled" } },
  });
  const newStatus = filledSlots >= totalSlots && totalSlots > 0 ? "filled" : "open";

  await prisma.shift.update({ where: { id: shiftId }, data: { status: newStatus } });

  return NextResponse.json({ ok: true, status: newStatus });
}
