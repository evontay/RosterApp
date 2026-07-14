import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password, name, phone, avatarEmoji, avatarColor, skillIds } = await req.json();

  const membership = await prisma.rosterMembership.findUnique({
    where: { inviteToken: token },
    include: { partTimer: true },
  });

  if (!membership || membership.status === "removed") {
    return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const { partTimerId, businessId } = membership;

  await prisma.user.update({
    where: { id: membership.partTimer.userId },
    data: { password: hashed },
  });

  await prisma.partTimer.update({
    where: { id: partTimerId },
    data: {
      name: name ?? membership.partTimer.name,
      phone: phone || null,
      avatarEmoji: avatarEmoji || null,
      avatarColor: avatarColor || null,
    },
  });

  if (Array.isArray(skillIds) && skillIds.length > 0) {
    await prisma.partTimerSkill.createMany({
      data: skillIds.map((skillId: string) => ({ partTimerId, skillId, businessId })),
      skipDuplicates: true,
    });
  }

  await prisma.rosterMembership.update({
    where: { id: membership.id },
    data: { status: "active", inviteToken: null },
  });

  return NextResponse.json({ ok: true });
}
