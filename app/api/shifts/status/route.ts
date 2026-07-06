import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TRANSITIONS: Record<string, string[]> = {
  open:      ["filled", "cancelled"],
  filled:    ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shiftId, status } = await req.json();

  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, business: { ownerUserId: session.user.id } },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  if (!VALID_TRANSITIONS[shift.status]?.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${shift.status} to ${status}` },
      { status: 400 }
    );
  }

  const updated = await prisma.shift.update({
    where: { id: shiftId },
    data: { status, ...(status === "cancelled" && { archived: true }) },
  });

  return NextResponse.json(updated);
}
