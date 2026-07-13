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
      memberships: { where: { status: "active" }, orderBy: { invitedAt: "asc" }, include: { business: { select: { name: true } } } },
      skills: { include: { skill: true } },
    },
  });
  if (!partTimer) redirect("/login");

  const businessIds = partTimer.memberships.map((m) => m.businessId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcomingAssignments, completedAssignments, kudosList, availableOpenShifts] = await Promise.all([
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
    prisma.shift.findMany({
      where: {
        businessId: { in: businessIds },
        status: "open",
        archived: false,
        shiftDate: { gte: today },
        NOT: [
          { assignments: { some: { partTimerId: partTimer.id, status: { not: "cancelled" } } } },
          { interests: { some: { partTimerId: partTimer.id, status: { in: ["pending", "confirmed"] } } } },
        ],
      },
      select: { id: true, title: true },
      orderBy: { shiftDate: "asc" },
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
    select: { id: true, title: true, business: { select: { name: true } } },
  });
  const shiftMap = new Map(kudosShifts.map((s) => [s.id, { title: s.title, businessName: s.business.name }]));

  // Build "Business · joined Mon Year" subtitle
  const businessName = partTimer.memberships[0]?.business.name ?? "";
  const joinedLabel = memberSince
    ? memberSince.toLocaleDateString("en-SG", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile card */}
      <div className="bg-sun-card rounded-[16px] border border-sun-border p-4">
        <div className="flex items-center gap-4">
          {/* Avatar — decorative, name is in the heading */}
          <div aria-hidden="true">
            <Avatar
              name={partTimer.name}
              avatarEmoji={partTimer.avatarEmoji}
              avatarColor={partTimer.avatarColor}
              id={partTimer.id}
              size="lg"
            />
          </div>

          {/* Name + subtitle + skills */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-medium text-sun-ink">{partTimer.name}</h1>
            {(businessName || joinedLabel) && (
              <p className="text-xs text-sun-mute mt-0.5">
                {[businessName, joinedLabel ? `joined ${joinedLabel}` : null].filter(Boolean).join(" · ")}
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

          {/* Stats tiles */}
          {totalShifts > 0 && (
            <div className="flex gap-2 shrink-0">
              <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 13px", textAlign: "center", minWidth: 52 }}>
                <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2 }} className="text-sun-ink">{totalShifts}</p>
                <p style={{ fontSize: 10 }} className="text-sun-mute mt-0.5">Shifts</p>
              </div>
              <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 13px", textAlign: "center", minWidth: 52 }}>
                <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2 }} className="text-sun-ink">
                  {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}
                </p>
                <p style={{ fontSize: 10 }} className="text-sun-mute mt-0.5">Hours</p>
              </div>
              <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 13px", textAlign: "center", minWidth: 52 }}>
                <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2, color: "#B45309" }}>${totalEarned.toFixed(0)}</p>
                <p style={{ fontSize: 10 }} className="text-sun-mute mt-0.5">Earned</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestones */}
      {(unlocked.length > 0 || next) && (
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-sun-ink">Milestones</h2>
            <span className="text-xs text-sun-mute">{unlocked.length} of 7 unlocked</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {unlocked.map((m) => (
              <span
                key={m.id}
                title={m.description}
                className="px-3 py-1.5 bg-sun-accent-soft text-sun-accent-text rounded-full text-xs font-medium"
              >
                {m.emoji} {m.label}
              </span>
            ))}
            {next && (
              <span className="px-3 py-1.5 bg-gray-50 text-sun-mute border border-dashed border-sun-faint rounded-full text-xs">
                🎖 {next.label} · {next.description}
              </span>
            )}
          </div>

          {unlocked.length === 0 && !next && (
            <p className="text-xs text-sun-mute">Complete your first shift to earn your first badge.</p>
          )}
        </div>
      )}

      {/* 2-column grid: Kudos + Upcoming shifts */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kudos card */}
        <div className="bg-sun-card border border-sun-border rounded-[16px] p-4">
          <h2 className="text-sm font-medium text-sun-ink mb-3">Kudos from your bosses 💛</h2>
          {kudosList.length > 0 ? (
            <div className="space-y-2">
              {kudosList.map((k) => {
                const shift = shiftMap.get(k.shiftId);
                return (
                  <div key={k.id} className="bg-sun-inset rounded-[12px] p-3">
                    <p className="text-xs text-sun-body leading-relaxed">{k.message}</p>
                    <p className="text-[10px] text-sun-mute mt-1">
                      {[shift?.businessName, shift?.title, k.createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short" })].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-sun-mute">No kudos yet — keep showing up! 🌱</p>
          )}
        </div>

        {/* Upcoming shifts card */}
        <div className="bg-sun-card border border-sun-border rounded-[16px] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-sun-ink">Upcoming shifts</h2>
            <Link href="/my-shifts" className="text-xs text-sun-accent-link">My shifts →</Link>
          </div>
          <div className="space-y-2">
            {upcomingAssignments.map((a) => {
              const { emoji, bg } = getShiftIcon(a.shift.title, a.shift.id);
              return (
                <Link
                  key={a.id}
                  href={`/shifts/${a.shift.id}`}
                  className="flex items-center gap-2.5 bg-sun-inset rounded-[12px] p-3 hover:opacity-90 transition-opacity"
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-sun-ink truncate">{a.shift.title}</p>
                    <p className="text-[10px] text-sun-mute mt-0.5 truncate">
                      {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}{a.shift.startTime}–{a.shift.endTime}
                      {a.shiftRole ? ` · ${a.shiftRole.skill.label}` : ""}
                    </p>
                  </div>
                  <span className="bg-status-confirmed-bg text-status-confirmed-text rounded-full text-[10px] px-2 py-0.5 shrink-0">
                    Confirmed
                  </span>
                </Link>
              );
            })}

            {upcomingAssignments.length === 0 && availableOpenShifts.length === 0 && (
              <p className="text-center text-sun-mute text-xs py-4">🌱 No upcoming shifts.</p>
            )}

            {availableOpenShifts.length > 0 && (
              <Link
                href="/open-shifts"
                className="flex items-center gap-2.5 border border-dashed border-sun-border rounded-[12px] p-3 hover:border-sun-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-[10px] bg-sun-inset flex items-center justify-center shrink-0" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-sun-mute" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-sun-body">{availableOpenShifts.length} open shift{availableOpenShifts.length !== 1 ? "s" : ""} you could join</p>
                  <p className="text-[10px] text-sun-mute truncate">{availableOpenShifts[0].title}</p>
                </div>
                <span className="bg-sun-accent-soft text-sun-accent-text rounded-full text-[10px] px-2 py-0.5 shrink-0">Browse →</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
