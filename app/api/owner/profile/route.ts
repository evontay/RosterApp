import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, ownerName, ownerPhone, avatarEmoji, avatarColor, businessAddress } =
    await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name: name.trim(),
      ownerName: ownerName?.trim() || null,
      ownerPhone: ownerPhone?.trim() || null,
      avatarEmoji: avatarEmoji ?? null,
      avatarColor: avatarColor ?? null,
      businessAddress: businessAddress?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
