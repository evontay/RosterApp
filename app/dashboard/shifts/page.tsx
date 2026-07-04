import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShiftLegend, ShiftStepBadge } from "./ShiftProgress";
import { ArchiveButton } from "./ArchiveButton";
import { ArchivedSection } from "./ArchivedSection";

export default async function ShiftsPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });

  if (!business) return <p className="text-gray-500">No business found.</p>;

  const shifts = await prisma.shift.findMany({
    where: { businessId: business.id },
    include: {
      roles: { include: { skill: true } },
      assignments: {
        where: { status: { not: "cancelled" } },
        include: { partTimer: true },
      },
    },
    orderBy: { shiftDate: "desc" },
  });

  const active = shifts.filter((s) => !s.archived);
  const archived = shifts.filter((s) => s.archived);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
        <Link
          href="/dashboard/shifts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + New shift
        </Link>
      </div>

      <div className="mb-4">
        <ShiftLegend />
      </div>

      <div className="space-y-3">
        {active.map((shift) => {
          const allPaid =
            shift.assignments.length > 0 &&
            shift.assignments.every((a) => a.paymentStatus === "paid");

          return (
            <div key={shift.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/shifts/${shift.id}`}
                    className="font-bold text-gray-800 hover:text-blue-600"
                  >
                    {shift.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(shift.shiftDate).toLocaleDateString("en-SG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {shift.startTime}–{shift.endTime} · {shift.roles.map((r) => `${r.skill.label} ×${r.count}`).join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {shift.roles.map((r) =>
                      r.payType === "hourly" ? `$${Number(r.payRate)}/hr` : `$${Number(r.payRate)} flat`
                    ).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ShiftStepBadge status={shift.status} allPaid={allPaid} />
                  {allPaid && <ArchiveButton shiftId={shift.id} archived={false} />}
                </div>
              </div>
              {shift.assignments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Assigned</p>
                  <div className="flex gap-2 flex-wrap">
                    {shift.assignments.map((a) => (
                      <span key={a.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {a.partTimer.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {active.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
            No active shifts. Create one to get started.
          </div>
        )}
      </div>

      <ArchivedSection
        shifts={archived.map((s) => ({
          ...s,
          roles: s.roles.map((r) => ({ ...r, payRate: Number(r.payRate) })),
          assignments: s.assignments.map((a) => ({
            id: a.id,
            partTimer: { name: a.partTimer.name },
            paymentStatus: a.paymentStatus,
          })),
        }))}
      />
    </div>
  );
}
