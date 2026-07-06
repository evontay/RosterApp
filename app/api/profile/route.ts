import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "part_timer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, avatarEmoji, avatarColor } = await req.json();

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
  });
  if (!partTimer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.partTimer.update({
    where: { id: partTimer.id },
    data: {
      name,
      phone: phone || null,
      avatarEmoji: avatarEmoji ?? null,
      avatarColor: avatarColor ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
