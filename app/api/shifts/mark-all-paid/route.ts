import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createActivities } from "@/lib/activity";

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

  // Fetch unpaid assignments before updating so we have their details
  const unpaidAssignments = await prisma.shiftAssignment.findMany({
    where: { shiftId, status: { not: "cancelled" }, paymentStatus: "unpaid" },
    include: { partTimer: { select: { userId: true } } },
  });

  await prisma.shiftAssignment.updateMany({
    where: { shiftId, status: { not: "cancelled" }, paymentStatus: "unpaid" },
    data: { paymentStatus: "paid" },
  });

  await createActivities(
    unpaidAssignments.map((a) => ({
      type: "PAID" as const,
      recipientId: a.partTimer.userId,
      entityType: "assignment",
      entityId: a.id,
      metadata: {
        shiftTitle: shift.title,
        shiftDate: shift.shiftDate.toISOString(),
        payAmount: a.payAmount ? Number(a.payAmount) : null,
      },
    }))
  );

  return NextResponse.json({ ok: true });
}
