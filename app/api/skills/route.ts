import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { label } = await req.json();
  const trimmed = label?.trim();
  if (!trimmed) return NextResponse.json({ error: "Label is required" }, { status: 400 });

  const existing = await prisma.skill.findUnique({ where: { label: trimmed } });
  if (existing) return NextResponse.json({ error: "Role already exists" }, { status: 400 });

  const skill = await prisma.skill.create({ data: { label: trimmed } });
  return NextResponse.json(skill);
}
