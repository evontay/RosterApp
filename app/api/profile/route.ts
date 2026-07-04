import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "part_timer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, availability, avatarEmoji, avatarColor } = await req.json();

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

  // Replace availability
  await prisma.availability.deleteMany({ where: { partTimerId: partTimer.id } });
  if (availability.length > 0) {
    await prisma.availability.createMany({
      data: availability.map((a: { dayOfWeek: string; startTime: string; endTime: string }) => ({
        partTimerId: partTimer.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    });
  }

  return NextResponse.json({ ok: true });
}
