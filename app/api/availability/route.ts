import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
  });
  if (!partTimer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { dayOfWeek, preference } = await req.json();

  if (!preference) {
    // Remove preference for this day
    await prisma.availability.deleteMany({
      where: { partTimerId: partTimer.id, dayOfWeek },
    });
  } else {
    // Upsert
    const existing = await prisma.availability.findFirst({
      where: { partTimerId: partTimer.id, dayOfWeek },
    });
    if (existing) {
      await prisma.availability.update({
        where: { id: existing.id },
        data: { preference },
      });
    } else {
      await prisma.availability.create({
        data: { partTimerId: partTimer.id, dayOfWeek, preference },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
