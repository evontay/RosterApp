import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { membershipId } = await req.json();

  const membership = await prisma.rosterMembership.findFirst({
    where: { id: membershipId, business: { ownerUserId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.rosterMembership.update({
    where: { id: membershipId },
    data: { status: "removed" },
  });

  return NextResponse.json({ ok: true });
}
