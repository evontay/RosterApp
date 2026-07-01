import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shift = await prisma.shift.findFirst({
    where: { id, business: { ownerUserId: session.user.id } },
    include: { roles: { include: { skill: true } }, assignments: { include: { partTimer: true } } },
  });
  if (!shift) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(shift);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, shiftDate, startTime, endTime, roles } = await req.json();

  const shift = await prisma.shift.findFirst({
    where: { id, business: { ownerUserId: session.user.id } },
  });
  if (!shift) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.shiftRole.deleteMany({ where: { shiftId: id } });

  const updated = await prisma.shift.update({
    where: { id },
    data: {
      title,
      shiftDate: new Date(shiftDate),
      startTime,
      endTime,
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

  return NextResponse.json(updated);
}
