import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TagsManager } from "./TagsManager";

export default async function PerformanceTagsPage() {
  const session = await auth();

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });
  if (!business) notFound();

  const tags = await prisma.performanceTag.findMany({
    where: { businessId: business.id },
    orderBy: { label: "asc" },
    select: {
      id: true,
      label: true,
      archived: true,
      _count: { select: { records: true } },
    },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-sun-ink mb-1">Performance tags</h1>
      <p className="text-sm text-sun-mute mb-6">
        Tags you can apply when recording a shift. Keep them job-relevant and specific.
      </p>
      <TagsManager tags={tags} />
    </div>
  );
}
