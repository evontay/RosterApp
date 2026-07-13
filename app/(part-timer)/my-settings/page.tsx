import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "../my-profile/ProfileForm";
import { AvailabilityEditor } from "./AvailabilityEditor";
import { SkillsEditor } from "./SkillsEditor";

export default async function MySettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    include: {
      availability: true,
      memberships: { orderBy: { invitedAt: "asc" }, take: 1 },
      skills: { select: { skillId: true } },
    },
  });

  if (!partTimer) redirect("/login");

  const memberSince = partTimer.memberships[0]?.invitedAt ?? null;
  const currentSkillIds = partTimer.skills.map((s) => s.skillId);

  const allSkills = await prisma.skill.findMany({
    where: { archived: false },
    orderBy: { label: "asc" },
    select: { id: true, label: true },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-sun-ink mb-6">Settings</h1>
      <ProfileForm partTimer={partTimer} memberSince={memberSince} />

      <div className="mt-6 bg-sun-card rounded-[16px] border border-sun-border p-5">
        <h2 className="text-sm font-semibold text-sun-body mb-4">Skills</h2>
        {allSkills.length === 0 ? (
          <p className="text-sm text-sun-mute">No skill types have been set up yet.</p>
        ) : (
          <SkillsEditor allSkills={allSkills} currentSkillIds={currentSkillIds} />
        )}
      </div>

      <div className="mt-6 bg-sun-card rounded-[16px] border border-sun-border p-5">
        <h2 className="text-sm font-semibold text-sun-body mb-4">Availability preference</h2>
        <AvailabilityEditor
          initial={partTimer.availability.map((a) => ({
            dayOfWeek: a.dayOfWeek,
            preference: a.preference,
          }))}
        />
      </div>
    </div>
  );
}
