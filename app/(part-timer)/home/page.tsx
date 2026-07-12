import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { computeMilestones } from "@/lib/milestones";

const ROLE_PILL_CLASSES = [
  "bg-role-purple-bg text-role-purple-text",
  "bg-role-blue-bg text-role-blue-text",
  "bg-role-pink-bg text-role-pink-text",
  "bg-role-green-bg text-role-green-text",
];

const SHIFT_EMOJIS = ["🎨", "🏺", "📦", "✂️", "🕯️", "🧶", "🌿", "🎸", "🌸", "🧑‍🎨"];
const SHIFT_BGS = ["#FDE68A", "#DBEAFE", "#D1FAE5", "#E9D5FF", "#FCE7F3"];

function getShiftIcon(title: string, id: string): { emoji: string; bg: string } {
  const code0 = id.charCodeAt(0) || 0;
  const code1 = id.charCodeAt(1) || 0;
  return {
    emoji: SHIFT_EMOJIS[code0 % SHIFT_EMOJIS.length],
    bg: SHIFT_BGS[code1 % SHIFT_BGS.length],
  };
}

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
      <div className="bg-sun-card rounded-[16px] border border-sun-border p-5">
        <div className="flex items-start gap-4">
          {/* Left: avatar + info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
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
                  {partTimer.skills.map((s, i) => (
                    <span
                      key={s.skillId}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_PILL_CLASSES[i % ROLE_PILL_CLASSES.length]}`}
                    >
                      {s.skill.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: stats tiles */}
          {totalShifts > 0 && (
            <div className="flex gap-2 shrink-0">
              <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 13px", textAlign: "center", minWidth: 56 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "inherit", lineHeight: 1.2 }} className="text-sun-ink">{totalShifts}</p>
                <p style={{ fontSize: 10 }} className="text-sun-mute mt-0.5">Shifts</p>
              </div>
              <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 13px", textAlign: "center", minWidth: 56 }}>
                <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }} className="text-sun-ink">
                  {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}
                </p>
                <p style={{ fontSize: 10 }} className="text-sun-mute mt-0.5">Hours</p>
              </div>
              <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 13px", textAlign: "center", minWidth: 56 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#B45309", lineHeight: 1.2 }}>${totalEarned.toFixed(0)}</p>
                <p style={{ fontSize: 10 }} className="text-sun-mute mt-0.5">Earned</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-sun-border">
          <Link href="/my-settings" className="text-sm text-sun-accent-link hover:underline">
            Edit profile →
          </Link>
        </div>
      </div>

      {/* Milestones */}
      {(unlocked.length > 0 || next) && (
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-sun-body">Milestones</h2>
            <span className="text-xs text-sun-mute">{unlocked.length} of 7 unlocked</span>
          </div>

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
            <span className="inline-flex items-center gap-1 bg-gray-50 text-sun-mute border border-dashed border-sun-faint rounded-full text-xs px-3 py-1">
              🎖 Next: {next.emoji} {next.label} — {next.description}
            </span>
          )}

          {unlocked.length === 0 && !next && (
            <p className="text-xs text-sun-mute">Complete your first shift to earn your first badge.</p>
          )}
        </div>
      )}

      {/* 2-column grid: Kudos + Upcoming shifts */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kudos card */}
        <div className="bg-sun-card border border-sun-border rounded-[16px] p-4">
          <h2 className="text-sm font-semibold text-sun-body mb-3">Kudos 💛</h2>
          {kudosList.length > 0 ? (
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
          ) : (
            <p className="text-xs text-sun-mute">No kudos yet — keep showing up! 🌱</p>
          )}
        </div>

        {/* Upcoming shifts card */}
        <div className="bg-sun-card border border-sun-border rounded-[16px] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-sun-body">Upcoming shifts</h2>
            <Link href="/my-shifts" className="text-xs text-sun-accent-link">My shifts →</Link>
          </div>
          {upcomingAssignments.length > 0 ? (
            <div className="space-y-2">
              {upcomingAssignments.map((a) => {
                const { emoji, bg } = getShiftIcon(a.shift.title, a.shift.id);
                return (
                  <Link
                    key={a.id}
                    href={`/shifts/${a.shift.id}`}
                    className="flex items-center gap-2 bg-sun-inset rounded-[12px] p-3 hover:opacity-90 transition-opacity"
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sun-ink truncate">{a.shift.title}</p>
                      <p className="text-xs text-sun-mute mt-0.5">
                        {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {a.shift.startTime}–{a.shift.endTime}
                      </p>
                      {a.shiftRole && (
                        <p className="text-xs text-sun-mute">{a.shiftRole.skill.label}</p>
                      )}
                    </div>
                    <span className="bg-status-confirmed-bg text-status-confirmed-text rounded-full text-[10px] px-2 py-0.5 shrink-0">
                      Confirmed
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-sun-mute text-sm py-4">
              🌱 No upcoming shifts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
