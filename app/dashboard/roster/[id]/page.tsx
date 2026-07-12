import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SkillEditor } from "./SkillEditor";
import { Avatar } from "@/components/Avatar";
import { TrustSignalsDisplay } from "./TrustSignals";
import { PerformanceLog } from "./PerformanceLog";
import { computeTrustSignals } from "@/lib/trust";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function PartTimerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });
  if (!business) notFound();

  const [membership, allSkills] = await Promise.all([
    prisma.rosterMembership.findFirst({
      where: { partTimerId: id, businessId: business.id },
      include: {
        partTimer: {
          include: {
            skills: {
              where: { businessId: business.id },
              include: { skill: true },
            },
            availability: true,
          },
        },
      },
    }),
    prisma.skill.findMany({ where: { archived: false }, orderBy: { label: "asc" }, select: { id: true, label: true } }),
  ]);
  if (!membership) notFound();

  const [assignments, coworkerRows, objectiveRecords] = await Promise.all([
    prisma.shiftAssignment.findMany({
      where: { partTimerId: id, shift: { businessId: business.id }, status: { not: "cancelled" } },
      include: { shift: { include: { roles: { include: { skill: true } } } } },
      orderBy: { shift: { shiftDate: "desc" } },
    }),
    prisma.shiftAssignment.findMany({
      where: {
        partTimerId: { not: id },
        status: { not: "cancelled" },
        shift: {
          businessId: business.id,
          assignments: { some: { partTimerId: id, status: { not: "cancelled" } } },
        },
      },
      select: {
        partTimerId: true,
        partTimer: { select: { id: true, name: true, avatarEmoji: true, avatarColor: true } },
      },
    }),
    prisma.objectiveRecord.findMany({
      where: { partTimerId: id, businessId: business.id },
      select: {
        attendance: true,
        qualityFlag: true,
        comment: true,
        createdAt: true,
        shiftId: true,
        tags: { select: { tag: { select: { label: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const { partTimer } = membership;

  // Deduplicate coworkers and count shared shifts
  const coworkerMap = new Map<string, { partTimer: typeof coworkerRows[0]["partTimer"]; count: number }>();
  for (const row of coworkerRows) {
    const existing = coworkerMap.get(row.partTimerId);
    if (existing) existing.count++;
    else coworkerMap.set(row.partTimerId, { partTimer: row.partTimer, count: 1 });
  }
  const coworkers = [...coworkerMap.values()].sort((a, b) => b.count - a.count);

  const trustSignals = computeTrustSignals(
    objectiveRecords.map((r) => ({
      attendance: r.attendance as "attended" | "late" | "no_show",
      qualityFlag: r.qualityFlag as "good" | "issues" | null,
      createdAt: r.createdAt,
    }))
  );

  // Fetch shift titles for the performance log
  const shiftIds = [...new Set(objectiveRecords.map((r) => r.shiftId))];
  const shiftsForLog = shiftIds.length > 0
    ? await prisma.shift.findMany({
        where: { id: { in: shiftIds } },
        select: { id: true, title: true, shiftDate: true },
      })
    : [];
  const shiftMap = new Map(shiftsForLog.map((s) => [s.id, s]));

  const totalEarned = assignments.reduce(
    (sum, a) => sum + (a.payAmount ? Number(a.payAmount) : 0), 0
  );
  const totalPaid = assignments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((sum, a) => sum + (a.payAmount ? Number(a.payAmount) : 0), 0);
  const totalOwed = totalEarned - totalPaid;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/roster" className="text-sm text-sun-mute hover:text-sun-body">
          ← Roster
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar
            name={partTimer.name}
            avatarEmoji={partTimer.avatarEmoji}
            avatarColor={partTimer.avatarColor}
            id={partTimer.id}
            size="lg"
          />
          <div>
          <h1 className="text-2xl font-bold text-sun-ink">{partTimer.name}</h1>
          <p className="text-sm text-sun-mute mt-0.5">
            {partTimer.email}{partTimer.phone ? ` · ${partTimer.phone}` : ""}
          </p>
          <p className="text-xs text-sun-mute mt-0.5">
            Member since {membership.invitedAt.toLocaleDateString("en-SG", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          membership.status === "active" ? "bg-status-confirmed-bg text-status-confirmed-text" :
          membership.status === "invited" ? "bg-pending-bg text-pending-text" :
          "bg-sun-inset text-sun-mute"
        }`}>
          {membership.status}
        </span>
      </div>

      {/* Performance signals */}
      <div className="mb-4">
        <TrustSignalsDisplay signals={trustSignals} />
      </div>

      {/* Performance log */}
      {objectiveRecords.length > 0 && (
        <div className="mb-6">
          <PerformanceLog
            records={objectiveRecords.map((r) => ({
              attendance: r.attendance as "attended" | "late" | "no_show",
              qualityFlag: r.qualityFlag as "good" | "issues" | null,
              comment: r.comment,
              createdAt: r.createdAt,
              tags: r.tags.map((t) => t.tag.label),
              shift: shiftMap.get(r.shiftId) ?? null,
            }))}
          />
        </div>
      )}

      {/* Skills & Availability */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-4">
          <h2 className="text-sm font-semibold text-sun-body mb-3">Skills</h2>
          <SkillEditor
            partTimerId={id}
            allSkills={allSkills}
            currentSkillIds={partTimer.skills.map((s) => s.skillId)}
          />
        </div>

        <div className="bg-sun-card rounded-[16px] border border-sun-border p-4">
          <h2 className="text-sm font-semibold text-sun-body mb-3">Availability</h2>
          {partTimer.availability.length > 0 ? (
            <div className="space-y-1">
              {DAYS.filter((d) => partTimer.availability.find((a) => a.dayOfWeek === d)).map((d) => {
                const a = partTimer.availability.find((a) => a.dayOfWeek === d)!;
                const label = a.preference === "morning" ? "Morning" : a.preference === "afternoon" ? "Afternoon" : "Flexible";
                return (
                  <div key={d} className="flex items-center gap-2 text-xs text-sun-body">
                    <span className="w-8 font-medium text-sun-ink">{d}</span>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-sun-mute">No preference set</p>
          )}
        </div>
      </div>

      {/* Pay summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-4 text-center">
          <p className="text-xs text-sun-mute mb-1">Shifts worked</p>
          <p className="text-xl font-bold text-sun-ink">{assignments.length}</p>
        </div>
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-4 text-center">
          <p className="text-xs text-sun-mute mb-1">Total earned</p>
          <p className="text-xl font-bold text-sun-accent-link">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-4 text-center">
          <p className="text-xs text-sun-mute mb-1">Outstanding</p>
          <p className={`text-xl font-bold ${totalOwed > 0 ? "text-pending-text" : "text-sun-ink"}`}>
            ${totalOwed.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Worked with */}
      {coworkers.length > 0 && (
        <div className="bg-sun-card rounded-[16px] border border-sun-border mb-6">
          <div className="px-5 py-4 border-b border-sun-border">
            <h2 className="font-semibold text-sun-body">Worked with</h2>
          </div>
          <div className="divide-y divide-sun-border">
            {coworkers.map(({ partTimer: cw, count }) => (
              <Link
                key={cw.id}
                href={`/dashboard/roster/${cw.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-sun-inset"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={cw.name}
                    avatarEmoji={cw.avatarEmoji}
                    avatarColor={cw.avatarColor}
                    id={cw.id}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-sun-ink">{cw.name}</span>
                </div>
                <span className="text-xs text-sun-mute">
                  {count} shift{count !== 1 ? "s" : ""} together
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Shift history */}
      <div className="bg-sun-card rounded-[16px] border border-sun-border">
        <div className="px-5 py-4 border-b border-sun-border">
          <h2 className="font-semibold text-sun-body">Shift history</h2>
        </div>
        {assignments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-sun-mute text-center">🌱 No shifts yet.</p>
        ) : (
          <div className="divide-y divide-sun-border">
            {assignments.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <Link
                    href={`/dashboard/shifts/${a.shift.id}`}
                    className="text-sm font-medium text-sun-ink hover:text-sun-accent-link"
                  >
                    {a.shift.title}
                  </Link>
                  <p className="text-xs text-sun-mute mt-0.5">
                    {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", {
                      weekday: "short", day: "numeric", month: "short", year: "numeric",
                    })}{" "}
                    · {a.shift.startTime}–{a.shift.endTime}
                    {a.hoursLogged != null ? ` · ${a.hoursLogged} hrs` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {a.payAmount != null ? (
                    <p className="text-sm font-medium text-sun-accent-link">${Number(a.payAmount).toFixed(2)}</p>
                  ) : (
                    <p className="text-xs text-sun-mute">Not logged</p>
                  )}
                  <span className={`text-xs font-medium ${a.paymentStatus === "paid" ? "text-status-confirmed-text" : "text-pending-text"}`}>
                    {a.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
