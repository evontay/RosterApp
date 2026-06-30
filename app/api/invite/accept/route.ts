import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  const membership = await prisma.rosterMembership.findUnique({
    where: { inviteToken: token },
    include: { partTimer: true },
  });

  if (!membership || membership.status === "removed") {
    return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: membership.partTimer.userId },
    data: { password: hashed },
  });

  await prisma.rosterMembership.update({
    where: { id: membership.id },
    data: { status: "active", inviteToken: null },
  });

  return NextResponse.json({ ok: true });
}
