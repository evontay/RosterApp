import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shiftId, partTimerId, shiftRoleId } = await req.json();

  // Verify shift belongs to owner's business
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, business: { ownerUserId: session.user.id } },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  // Verify part-timer is an active roster member
  const membership = await prisma.rosterMembership.findFirst({
    where: { businessId: shift.businessId, partTimerId, status: "active" },
  });
  if (!membership) {
    return NextResponse.json({ error: "Employee not on active roster" }, { status: 400 });
  }

  // Prevent duplicate assignment — only check slot-based assignments (shiftRoleId set).
  // Old orphaned assignments (shiftRoleId null, from before slot system) are left untouched.
  const existing = await prisma.shiftAssignment.findFirst({
    where: { shiftId, partTimerId, shiftRoleId: { not: null }, status: { not: "cancelled" } },
  });
  if (existing) {
    return NextResponse.json({ error: "Employee is already assigned to this shift" }, { status: 400 });
  }

  // Enforce slot cap for the role
  if (shiftRoleId) {
    const role = await prisma.shiftRole.findUnique({ where: { id: shiftRoleId } });
    if (!role || role.shiftId !== shiftId) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const filledSlots = await prisma.shiftAssignment.count({
      where: { shiftRoleId, status: { not: "cancelled" } },
    });
    if (filledSlots >= role.count) {
      return NextResponse.json({ error: "This role is already fully staffed" }, { status: 400 });
    }
  }

  const assignment = await prisma.shiftAssignment.create({
    data: { shiftId, partTimerId, shiftRoleId: shiftRoleId ?? null, status: "assigned" },
  });

  // Auto-advance to "filled" if all slots are now taken
  if (shift.status === "open") {
    const roles = await prisma.shiftRole.findMany({
      where: { shiftId },
      select: { id: true, count: true },
    });
    const totalSlots = roles.reduce((sum, r) => sum + r.count, 0);
    const filledSlots = await prisma.shiftAssignment.count({
      where: { shiftId, shiftRoleId: { not: null }, status: { not: "cancelled" } },
    });
    if (filledSlots >= totalSlots) {
      await prisma.shift.update({ where: { id: shiftId }, data: { status: "filled" } });
    }
  }

  return NextResponse.json(assignment);
}
