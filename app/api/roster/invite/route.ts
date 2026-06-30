import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId, name, email, phone } = await req.json();

  // Verify this business belongs to the owner
  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerUserId: session.user.id },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Check if part-timer user already exists
  let user = await prisma.user.findUnique({ where: { email } });
  let partTimer = user ? await prisma.partTimer.findUnique({ where: { userId: user.id } }) : null;

  if (!user) {
    // Create a placeholder user with a random password (they'll set it via invite)
    const tempPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
    user = await prisma.user.create({
      data: { email, password: tempPassword, role: "part_timer" },
    });
  }

  if (!partTimer) {
    partTimer = await prisma.partTimer.create({
      data: { userId: user.id, name, email, phone: phone || null },
    });
  }

  // Check for existing membership
  const existing = await prisma.rosterMembership.findUnique({
    where: { businessId_partTimerId: { businessId, partTimerId: partTimer.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already on roster" }, { status: 400 });
  }

  const inviteToken = crypto.randomBytes(24).toString("hex");
  await prisma.rosterMembership.create({
    data: { businessId, partTimerId: partTimer.id, inviteToken, status: "invited" },
  });

  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${inviteToken}`;
  return NextResponse.json({ inviteUrl });
}
