import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shiftId } = await req.json();

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "No business" }, { status: 403 });

  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, businessId: business.id },
  });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  await prisma.shiftAssignment.updateMany({
    where: { shiftId, status: { not: "cancelled" }, paymentStatus: "unpaid" },
    data: { paymentStatus: "paid" },
  });

  return NextResponse.json({ ok: true });
}
