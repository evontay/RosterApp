import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shiftId, archived } = await req.json();

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "No business" }, { status: 403 });

  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, businessId: business.id },
    include: {
      assignments: { where: { status: { not: "cancelled" } }, select: { paymentStatus: true } },
    },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  // Allow archiving if fully paid or cancelled; unarchiving always allowed
  if (archived && shift.status !== "cancelled") {
    const allPaid =
      shift.assignments.length > 0 &&
      shift.assignments.every((a) => a.paymentStatus === "paid");
    if (!allPaid) {
      return NextResponse.json({ error: "Only fully paid shifts can be archived" }, { status: 400 });
    }
  }

  await prisma.shift.update({
    where: { id: shiftId },
    data: { archived },
  });

  return NextResponse.json({ ok: true });
}
