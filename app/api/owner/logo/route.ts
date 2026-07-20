import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, or GIF allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
    select: { id: true, logoUrl: true },
  });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  // Delete old logo if present
  if (business.logoUrl) {
    try { await del(business.logoUrl); } catch {}
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const blob = await put(`logos/${business.id}-${Date.now()}.${ext}`, file, {
    access: "public",
  });

  await prisma.business.update({
    where: { id: business.id },
    data: { logoUrl: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
    select: { id: true, logoUrl: true },
  });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  if (business.logoUrl) {
    try { await del(business.logoUrl); } catch {}
  }

  await prisma.business.update({
    where: { id: business.id },
    data: { logoUrl: null },
  });

  return NextResponse.json({ ok: true });
}
