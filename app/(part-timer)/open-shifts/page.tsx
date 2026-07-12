import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InterestForm } from "./InterestForm";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sun-ink">Open Shifts</h1>

      {shifts.length === 0 ? (
        <div className="bg-sun-card rounded-[16px] border border-sun-border p-8 text-center text-sun-mute text-sm">
          🌱 No open shifts right now.
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => {
            const isAssigned = assignedShiftIds.has(shift.id);
            const interest = interestByShift[shift.id] ?? null;

            return (
              <div key={shift.id} className="bg-sun-card rounded-[16px] border border-sun-border p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
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

                {/* Roles summary */}
                {shift.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
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
        </div>
      )}
    </div>
  );
}
