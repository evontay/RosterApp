import { prisma } from "@/lib/prisma";
import { RolesManager } from "./RolesManager";

export default async function RolesSettingsPage() {
  const skills = await prisma.skill.findMany({
    orderBy: { label: "asc" },
    include: {
      _count: { select: { shiftRoles: true, partTimers: true } },
    },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Role types</h1>
      <p className="text-sm text-gray-500 mb-6">
        Rename or delete role types here. To add new ones, use the shift form.
      </p>
      <RolesManager
        skills={skills.map((s) => ({
          id: s.id,
          label: s.label,
          shiftCount: s._count.shiftRoles,
          partTimerCount: s._count.partTimers,
        }))}
      />
    </div>
  );
}
