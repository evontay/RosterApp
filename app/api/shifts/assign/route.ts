import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shiftId, partTimerId } = await req.json();

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

  const assignment = await prisma.shiftAssignment.create({
    data: { shiftId, partTimerId, status: "assigned" },
  });

  return NextResponse.json(assignment);
}
