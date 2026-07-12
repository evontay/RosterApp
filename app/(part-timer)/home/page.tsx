import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { computeMilestones } from "@/lib/milestones";

export default async function EmployeeHomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    include: {
      memberships: { orderBy: { invitedAt: "asc" }, take: 1 },
      skills: { include: { skill: true } },
    },
  });
  if (!partTimer) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcomingAssignments, completedAssignments, kudosList] = await Promise.all([
    prisma.shiftAssignment.findMany({
      where: {
        partTimerId: partTimer.id,
        status: "assigned",
        shift: { shiftDate: { gte: today }, status: { not: "cancelled" } },
      },
      include: {
        shift: { include: { business: true } },
        shiftRole: { include: { skill: true } },
      },
      orderBy: { shift: { shiftDate: "asc" } },
    }),
    prisma.shiftAssignment.findMany({
      where: { partTimerId: partTimer.id, status: "completed" },
      include: {
        shift: {
          include: {
            assignments: {
              where: { status: "completed", partTimerId: { not: partTimer.id } },
              select: { partTimerId: true },
            },
          },
        },
      },
    }),
    prisma.kudos.findMany({
      where: { partTimerId: partTimer.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Shift history stats
  const totalShifts = completedAssignments.length;
  const totalHours = completedAssignments.reduce((sum, a) => sum + (a.hoursLogged ? Number(a.hoursLogged) : 0), 0);
  const totalEarned = completedAssignments.reduce((sum, a) => sum + (a.payAmount ? Number(a.payAmount) : 0), 0);

  // Unique coworkers across all completed shifts
  const allCoworkerIds = new Set(
    completedAssignments.flatMap((a) => a.shift.assignments.map((x) => x.partTimerId))
  );

  const { unlocked, next } = computeMilestones({
    completedShifts: totalShifts,
    uniqueCoworkers: allCoworkerIds.size,
  });

  const memberSince = partTimer.memberships[0]?.invitedAt ?? null;

  // Fetch shift titles for kudos
  const kudosShiftIds = [...new Set(kudosList.map((k) => k.shiftId))];
  const kudosShifts = await prisma.shift.findMany({
    where: { id: { in: kudosShiftIds } },
    select: { id: true, title: true },
  });
  const shiftTitleMap = new Map(kudosShifts.map((s) => [s.id, s.title]));

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-sun-card rounded-[16px] border border-sun-border p-6">
        <div className="flex items-center gap-5">
          <Avatar
            name={partTimer.name}
            avatarEmoji={partTimer.avatarEmoji}
            avatarColor={partTimer.avatarColor}
            id={partTimer.id}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-sun-ink">{partTimer.name}</h1>
            <p className="text-sm text-sun-mute mt-0.5">{partTimer.email}</p>
            {partTimer.phone && (
              <p className="text-sm text-sun-mute">{partTimer.phone}</p>
            )}
            {memberSince && (
              <p className="text-xs text-sun-mute mt-1">
                Member since{" "}
                {memberSince.toLocaleDateString("en-SG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            {partTimer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {partTimer.skills.map((s) => (
                  <span key={s.skillId} className="px-2 py-0.5 bg-sun-inset text-sun-body rounded-full text-xs">
                    {s.skill.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shift stats */}
        {totalShifts > 0 && (
          <div className="mt-4 pt-4 border-t border-sun-border grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-sun-ink">{totalShifts}</p>
              <p className="text-xs text-sun-mute">Shifts</p>
            </div>
            <div>
              <p className="text-lg font-bold text-sun-ink">{totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}</p>
              <p className="text-xs text-sun-mute">Hours</p>
            </div>
            <div>
              <p className="text-lg font-bold text-sun-accent-link">${totalEarned.toFixed(0)}</p>
              <p className="text-xs text-sun-mute">Earned</p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-sun-border">
          <Link href="/my-settings" className="text-sm text-sun-accent-link hover:underline">
            Edit profile →
          </Link>
        </div>
      </div>

      {/* Milestones */}
      {(unlocked.length > 0 || next) && (
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-5">
          <h2 className="text-sm font-semibold text-sun-body mb-3">Milestones</h2>

          {unlocked.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {unlocked.map((m) => (
                <div
                  key={m.id}
                  title={m.description}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sun-accent-soft border border-sun-border rounded-full text-xs font-medium text-sun-accent-text"
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          )}

          {next && (
            <p className="text-xs text-sun-mute">
              Next: {next.emoji} {next.label} — {next.description}
            </p>
          )}

          {unlocked.length === 0 && (
            <p className="text-xs text-sun-mute">Complete your first shift to earn your first badge.</p>
          )}
        </div>
      )}

      {/* Kudos */}
      {kudosList.length > 0 && (
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-5">
          <h2 className="text-sm font-semibold text-sun-body mb-3">Kudos 💛</h2>
          <div className="space-y-3">
            {kudosList.map((k) => (
              <div key={k.id} className="flex gap-3 bg-sun-inset rounded-[12px] p-3">
                <div>
                  <p className="text-sm text-sun-body">{k.message}</p>
                  <p className="text-xs text-sun-mute mt-0.5">
                    {shiftTitleMap.get(k.shiftId) ?? "Shift"} ·{" "}
                    {k.createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming shifts */}
      <div>
        <h2 className="text-sm font-semibold text-sun-mute uppercase tracking-wide mb-3">
          Upcoming shifts
        </h2>
        <div className="space-y-3">
          {upcomingAssignments.map((a) => (
            <Link
              key={a.id}
              href={`/shifts/${a.shift.id}`}
              className="block bg-sun-card rounded-[16px] border border-sun-border p-4 hover:border-sun-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sun-ink">{a.shift.title}</p>
                  <p className="text-sm text-sun-mute mt-0.5">
                    {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {a.shift.startTime}–{a.shift.endTime}
                  </p>
                  {a.shiftRole && (
                    <p className="text-xs text-sun-mute mt-0.5">{a.shiftRole.skill.label}</p>
                  )}
                </div>
                {a.payAmount != null && (
                  <p className="text-sm font-semibold text-sun-accent-link shrink-0">
                    ${Number(a.payAmount).toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {upcomingAssignments.length === 0 && (
            <div className="bg-sun-card rounded-[16px] border border-sun-border p-6 text-center text-sun-mute text-sm">
              🌱 No upcoming shifts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
