import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interestId } = await req.json();
  if (!interestId) return NextResponse.json({ error: "interestId required" }, { status: 400 });

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const interest = await prisma.shiftInterest.findFirst({
    where: { id: interestId, shift: { businessId: business.id }, status: "pending" },
  });
  if (!interest) return NextResponse.json({ error: "Interest not found" }, { status: 404 });

  await prisma.shiftInterest.update({
    where: { id: interestId },
    data: { status: "rejected" },
  });

  return NextResponse.json({ ok: true });
}
