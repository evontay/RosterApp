import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId } = await req.json();

  const assignment = await prisma.shiftAssignment.update({
    where: { id: assignmentId },
    data: { paymentStatus: "paid", paidAt: new Date() },
  });

  return NextResponse.json(assignment);
}
