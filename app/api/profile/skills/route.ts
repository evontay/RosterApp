import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "part_timer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    include: {
      memberships: {
        where: { status: "active" },
        select: { businessId: true },
      },
    },
  });
  if (!partTimer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { skillIds } = await req.json();
  if (!Array.isArray(skillIds)) {
    return NextResponse.json({ error: "skillIds must be an array" }, { status: 400 });
  }

  const businessIds = partTimer.memberships.map((m) => m.businessId);

  // Replace skills for every active business membership
  await prisma.partTimerSkill.deleteMany({
    where: { partTimerId: partTimer.id, businessId: { in: businessIds } },
  });

  if (skillIds.length > 0 && businessIds.length > 0) {
    await prisma.partTimerSkill.createMany({
      data: businessIds.flatMap((businessId) =>
        skillIds.map((skillId: string) => ({ partTimerId: partTimer.id, skillId, businessId }))
      ),
    });
  }

  return NextResponse.json({ ok: true });
}
