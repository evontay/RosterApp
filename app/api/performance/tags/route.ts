import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — create a new tag
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({ where: { ownerUserId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { label } = await req.json();
  const trimmed = label?.trim();
  if (!trimmed) return NextResponse.json({ error: "label required" }, { status: 400 });

  const tag = await prisma.performanceTag.create({
    data: { businessId: business.id, label: trimmed },
  });

  return NextResponse.json(tag);
}

// PATCH — rename or archive/restore a tag
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({ where: { ownerUserId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id, label, archived } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const tag = await prisma.performanceTag.findFirst({
    where: { id, businessId: business.id },
  });
  if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

  const updated = await prisma.performanceTag.update({
    where: { id },
    data: {
      ...(label !== undefined && { label: label.trim() }),
      ...(archived !== undefined && { archived }),
    },
  });

  return NextResponse.json(updated);
}
