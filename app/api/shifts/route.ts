import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, title, shiftDate, startTime, endTime, roles } = await req.json();

  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const shift = await prisma.shift.create({
    data: {
      businessId,
      title,
      shiftDate: new Date(shiftDate),
      startTime,
      endTime,
      status: "open",
      roles: {
        create: (roles as { skillId: string; count: number; payType: string; payRate: number }[]).map((r) => ({
          skillId: r.skillId,
          count: r.count,
          payType: r.payType as "hourly" | "flat_session",
          payRate: r.payRate,
        })),
      },
    },
    include: { roles: { include: { skill: true } } },
  });

  return NextResponse.json(shift);
}
