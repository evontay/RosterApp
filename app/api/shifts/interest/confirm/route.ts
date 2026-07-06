import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — owner confirms interest → creates ShiftAssignment
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interestId, shiftRoleId } = await req.json();
  if (!interestId) return NextResponse.json({ error: "interestId required" }, { status: 400 });

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const interest = await prisma.shiftInterest.findFirst({
    where: { id: interestId, shift: { businessId: business.id }, status: "pending" },
    include: { shift: true },
  });
  if (!interest) return NextResponse.json({ error: "Interest not found" }, { status: 404 });

  // Resolve which role to assign to
  const roleId = interest.shiftRoleId ?? shiftRoleId;
  if (!roleId) return NextResponse.json({ error: "shiftRoleId required for general interest" }, { status: 400 });

  // Check slot capacity
  const role = await prisma.shiftRole.findUnique({ where: { id: roleId } });
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  const filled = await prisma.shiftAssignment.count({
    where: { shiftRoleId: roleId, status: { not: "cancelled" } },
  });
  if (filled >= role.count) {
    return NextResponse.json({ error: "Slot is full" }, { status: 409 });
  }

  // Check not already assigned to this shift
  const duplicate = await prisma.shiftAssignment.findFirst({
    where: { shiftId: interest.shiftId, partTimerId: interest.partTimerId, status: { not: "cancelled" } },
  });
  if (duplicate) return NextResponse.json({ error: "Already assigned to this shift" }, { status: 409 });

  await prisma.$transaction([
    prisma.shiftAssignment.create({
      data: {
        shiftId: interest.shiftId,
        partTimerId: interest.partTimerId,
        shiftRoleId: roleId,
        status: "assigned",
      },
    }),
    prisma.shiftInterest.update({
      where: { id: interestId },
      data: { status: "confirmed" },
    }),
    // Reject other pending interests from this employee on the same shift
    prisma.shiftInterest.updateMany({
      where: {
        shiftId: interest.shiftId,
        partTimerId: interest.partTimerId,
        id: { not: interestId },
        status: "pending",
      },
      data: { status: "confirmed" },
    }),
  ]);

  // Auto-advance shift to filled if all slots taken
  const shiftId = interest.shiftId;
  const roles = await prisma.shiftRole.findMany({ where: { shiftId }, select: { id: true, count: true } });
  const totalSlots = roles.reduce((sum, r) => sum + r.count, 0);
  const filledSlots = await prisma.shiftAssignment.count({
    where: { shiftId, shiftRoleId: { not: null }, status: { not: "cancelled" } },
  });
  if (filledSlots >= totalSlots && interest.shift.status === "open") {
    await prisma.shift.update({ where: { id: shiftId }, data: { status: "filled" } });
  }

  return NextResponse.json({ ok: true });
}
