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
  type RoleInput = { skillId: string; count: number; payType: string; payRate: number };
  const newRoles = roles as RoleInput[];

  const shift = await prisma.shift.findFirst({
    where: { id, business: { ownerUserId: session.user.id } },
    include: { roles: true },
  });
  if (!shift) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingBySkill = new Map(shift.roles.map((r) => [r.skillId, r]));
  const newSkillIds = new Set(newRoles.map((r) => r.skillId));

  // Remove roles that are no longer in the list, nulling out their assignments first
  const toRemove = shift.roles.filter((r) => !newSkillIds.has(r.skillId));
  if (toRemove.length > 0) {
    const removeIds = toRemove.map((r) => r.id);
    await prisma.shiftAssignment.updateMany({
      where: { shiftRoleId: { in: removeIds } },
      data: { shiftRoleId: null },
    });
    await prisma.shiftRole.deleteMany({ where: { id: { in: removeIds } } });
  }

  // Update existing roles in-place (preserves assignment links), create new ones
  await Promise.all(
    newRoles.map((r) => {
      const existing = existingBySkill.get(r.skillId);
      if (existing) {
        return prisma.shiftRole.update({
          where: { id: existing.id },
          data: { count: r.count, payType: r.payType as "hourly" | "flat_session", payRate: r.payRate },
        });
      }
      return prisma.shiftRole.create({
        data: { shiftId: id, skillId: r.skillId, count: r.count, payType: r.payType as "hourly" | "flat_session", payRate: r.payRate },
      });
    })
  );

  const updated = await prisma.shift.update({
    where: { id },
    data: { title, shiftDate: new Date(shiftDate), startTime, endTime },
    include: { roles: { include: { skill: true } } },
  });

  return NextResponse.json(updated);
}
