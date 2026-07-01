import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { label, defaultPayType, defaultPayRate } = await req.json();

  // Rename
  if (label !== undefined) {
    const trimmed = label?.trim();
    if (!trimmed) return NextResponse.json({ error: "Label is required" }, { status: 400 });
    const existing = await prisma.skill.findUnique({ where: { label: trimmed } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "A role with that name already exists" }, { status: 400 });
    }
  }

  const skill = await prisma.skill.update({
    where: { id },
    data: {
      ...(label !== undefined && { label: label.trim() }),
      ...(defaultPayType !== undefined && { defaultPayType: defaultPayType || null }),
      ...(defaultPayRate !== undefined && { defaultPayRate: defaultPayRate ? parseFloat(defaultPayRate) : null }),
    },
  });
  return NextResponse.json(skill);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inUse = await prisma.shiftRole.findFirst({ where: { skillId: id } });
  if (inUse) {
    return NextResponse.json(
      { error: "This role is used in existing shifts and can't be deleted" },
      { status: 400 }
    );
  }

  const partTimerUse = await prisma.partTimerSkill.findFirst({ where: { skillId: id } });
  if (partTimerUse) {
    return NextResponse.json(
      { error: "This role is assigned to part-timers and can't be deleted" },
      { status: 400 }
    );
  }

  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
