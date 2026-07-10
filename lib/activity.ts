import { prisma } from "@/lib/prisma";
import { ActivityType, Prisma } from "@prisma/client";

export async function createActivity({
  type,
  recipientId,
  entityType,
  entityId,
  metadata,
}: {
  type: ActivityType;
  recipientId: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.activity.create({
    data: { type, recipientId, entityType, entityId, metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull, read: false },
  });
}

export async function createActivities(
  items: {
    type: ActivityType;
    recipientId: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }[]
) {
  if (items.length === 0) return;
  await prisma.activity.createMany({
    data: items.map((i) => ({
      type: i.type,
      recipientId: i.recipientId,
      entityType: i.entityType,
      entityId: i.entityId,
      metadata: i.metadata ? (i.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      read: false,
    })),
  });
}
