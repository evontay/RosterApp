import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createActivity } from "@/lib/activity";

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

  // Check for any existing non-cancelled assignment for this person on this shift
  const existing = await prisma.shiftAssignment.findFirst({
    where: { shiftId, partTimerId, status: { not: "cancelled" } },
  });
  // If they already have a role-linked assignment, they're properly assigned
  if (existing?.shiftRoleId) {
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

  // Re-use an orphaned assignment (shiftRoleId nulled by a prior shift edit) to avoid duplicates
  let assignment;
  if (existing && !existing.shiftRoleId) {
    assignment = await prisma.shiftAssignment.update({
      where: { id: existing.id },
      data: { shiftRoleId: shiftRoleId ?? null, status: "assigned" },
    });
  } else {
    assignment = await prisma.shiftAssignment.create({
      data: { shiftId, partTimerId, shiftRoleId: shiftRoleId ?? null, status: "assigned" },
    });
  }

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

  // Notify employee
  const partTimer = await prisma.partTimer.findUnique({
    where: { id: partTimerId },
    select: { userId: true },
  });
  if (partTimer) {
    await createActivity({
      type: "ASSIGNED",
      recipientId: partTimer.userId,
      entityType: "shift",
      entityId: shiftId,
      metadata: {
        shiftTitle: shift.title,
        shiftDate: shift.shiftDate.toISOString(),
      },
    });
  }

  return NextResponse.json(assignment);
}
