import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partTimerId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify this part-timer is on the roster
  const membership = await prisma.rosterMembership.findFirst({
    where: { partTimerId, businessId: business.id },
  });
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { skillIds } = await req.json();

  await prisma.partTimerSkill.deleteMany({
    where: { partTimerId, businessId: business.id },
  });

  if (skillIds.length > 0) {
    await prisma.partTimerSkill.createMany({
      data: skillIds.map((skillId: string) => ({
        partTimerId,
        skillId,
        businessId: business.id,
      })),
    });
  }

  return NextResponse.json({ ok: true });
}
