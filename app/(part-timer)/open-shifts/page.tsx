import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InterestForm } from "./InterestForm";

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

export default async function OpenShiftsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    include: {
      memberships: { where: { status: "active" }, select: { businessId: true } },
    },
  });
  if (!partTimer) redirect("/login");

  const businessIds = partTimer.memberships.map((m) => m.businessId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [shifts, myInterests, myAssignments] = await Promise.all([
    prisma.shift.findMany({
      where: {
        businessId: { in: businessIds },
        status: "open",
        archived: false,
        shiftDate: { gte: today },
      },
      include: {
        business: true,
        roles: { include: { skill: true } },
      },
      orderBy: { shiftDate: "asc" },
    }),
    prisma.shiftInterest.findMany({
      where: { partTimerId: partTimer.id, shiftRoleId: null },
      select: { shiftId: true, status: true, comment: true },
    }),
    prisma.shiftAssignment.findMany({
      where: { partTimerId: partTimer.id, status: { not: "cancelled" } },
      select: { shiftId: true },
    }),
  ]);

  const assignedShiftIds = new Set(myAssignments.map((a) => a.shiftId));
  const interestByShift = Object.fromEntries(myInterests.map((i) => [i.shiftId, i]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-sun-ink">Open Shifts</h1>
        <p className="text-xs text-sun-mute mb-4">{shifts.length} upcoming shift{shifts.length !== 1 ? "s" : ""} you could join · interest is never a commitment until confirmed</p>
      </div>

      {shifts.length === 0 ? (
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-8 text-center text-sun-mute text-sm">
          🌱 No open shifts right now.
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => {
            const isAssigned = assignedShiftIds.has(shift.id);
            const interest = interestByShift[shift.id] ?? null;
            const { emoji, bg } = getShiftIcon(shift.title, shift.id);

            return (
              <div key={shift.id} className="bg-sun-card rounded-[16px] border border-sun-border p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-sun-ink">{shift.title}</p>
                        <p className="text-sm text-sun-mute mt-0.5">
                          {new Date(shift.shiftDate).toLocaleDateString("en-SG", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          · {shift.startTime}–{shift.endTime}
                        </p>
                        <p className="text-xs text-sun-mute mt-0.5">{shift.business.name}</p>
                      </div>
                      {isAssigned && (
                        <span className="text-xs font-medium px-2 py-1 bg-status-confirmed-bg text-status-confirmed-text rounded-full shrink-0">
                          Assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Roles summary */}
                {shift.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {shift.roles.map((r) => (
                      <span key={r.id} className="text-xs bg-sun-inset text-sun-body px-2 py-0.5 rounded-full">
                        {r.skill.label} ×{r.count}
                      </span>
                    ))}
                  </div>
                )}

                {!isAssigned && (
                  <InterestForm
                    shiftId={shift.id}
                    currentStatus={interest?.status ?? null}
                    currentComment={interest?.comment ?? null}
                  />
                )}
              </div>
            );
          })}

          <div className="border border-dashed border-sun-border rounded-[16px] p-5 text-center text-sm text-sun-mute">
            That&apos;s everything for now — new shifts show up here the moment a boss posts them 🌱
          </div>
        </div>
      )}
    </div>
  );
}
