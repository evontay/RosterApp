import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewShiftForm } from "./NewShiftForm";

export default async function NewShiftPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });

  if (!business) return <p className="text-sun-mute">No business found.</p>;

  const skills = await prisma.skill.findMany({
    where: { archived: false },
    orderBy: { label: "asc" },
    select: { id: true, label: true, defaultPayType: true, defaultPayRate: true },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-sun-ink mb-6">New Shift</h1>
      <NewShiftForm
        businessId={business.id}
        skills={skills.map((s) => ({
          id: s.id,
          label: s.label,
          defaultPayType: s.defaultPayType,
          defaultPayRate: s.defaultPayRate ? Number(s.defaultPayRate) : null,
        }))}
      />
    </div>
  );
}
