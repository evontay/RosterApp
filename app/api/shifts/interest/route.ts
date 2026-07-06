import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — express or withdraw interest
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "part_timer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shiftId, comment, withdraw } = await req.json();
  if (!shiftId) return NextResponse.json({ error: "shiftId required" }, { status: 400 });

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
  });
  if (!partTimer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify shift is open and part-timer is in the business's roster
  const shift = await prisma.shift.findFirst({
    where: {
      id: shiftId,
      status: "open",
      business: {
        rosterMembers: { some: { partTimerId: partTimer.id, status: "active" } },
      },
    },
  });
  if (!shift) return NextResponse.json({ error: "Shift not available" }, { status: 404 });

  if (withdraw) {
    await prisma.shiftInterest.updateMany({
      where: { shiftId, partTimerId: partTimer.id, shiftRoleId: null, status: "pending" },
      data: { status: "withdrawn" },
    });
    return NextResponse.json({ ok: true });
  }

  // Upsert interest — reset to pending if previously withdrawn/rejected
  const existing = await prisma.shiftInterest.findFirst({
    where: { shiftId, partTimerId: partTimer.id, shiftRoleId: null },
  });

  if (existing) {
    if (existing.status === "pending") {
      return NextResponse.json({ error: "Already expressed interest" }, { status: 409 });
    }
    await prisma.shiftInterest.update({
      where: { id: existing.id },
      data: { status: "pending", comment: comment?.trim() || null },
    });
  } else {
    await prisma.shiftInterest.create({
      data: {
        shiftId,
        partTimerId: partTimer.id,
        shiftRoleId: null,
        status: "pending",
        comment: comment?.trim() || null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
