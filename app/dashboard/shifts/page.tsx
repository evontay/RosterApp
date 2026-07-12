import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShiftStepBadge } from "./ShiftProgress";
import { ArchiveButton } from "./ArchiveButton";
import { ArchivedSection } from "./ArchivedSection";

import { YearCalendar } from "../calendar/YearCalendar";

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; year?: string; month?: string }>;
}) {
  const { sort, year, month } = await searchParams;
  const asc = sort === "asc";

  const now = new Date();
  const calYear = year ? parseInt(year) : now.getFullYear();
  const calMonth = month !== undefined ? parseInt(month) : now.getMonth();
  const windowStart = new Date(calYear, calMonth, 1);
  const windowEnd = new Date(calYear, calMonth + 3, 1);

  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });
  if (!business) return <p className="text-sun-mute">No business found.</p>;

  const [shifts, calendarShifts, skills] = await Promise.all([
    prisma.shift.findMany({
      where: { businessId: business.id },
      include: {
        roles: { include: { skill: true } },
        assignments: {
          where: { status: { not: "cancelled" } },
          include: { partTimer: true },
        },
      },
      orderBy: { shiftDate: asc ? "asc" : "desc" },
    }),
    prisma.shift.findMany({
      where: {
        businessId: business.id,
        shiftDate: { gte: windowStart, lt: windowEnd },
        status: { not: "cancelled" },
      },
      include: {
        roles: { include: { skill: true } },
        assignments: { include: { partTimer: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.skill.findMany({
      where: { archived: false },
      orderBy: { label: "asc" },
      select: { id: true, label: true, defaultPayType: true, defaultPayRate: true },
    }),
  ]);

  const active = shifts.filter((s) => !s.archived);
  const archived = shifts.filter((s) => s.archived);

  // Sort toggle preserves calendar params
  const sortParams = new URLSearchParams();
  if (!asc) sortParams.set("sort", "asc");
  if (year) sortParams.set("year", year);
  if (month !== undefined) sortParams.set("month", month);

  return (
    <div className="flex gap-6 items-start">
      {/* Left: Shifts list */}
      <div className="w-96 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-sun-ink">Shifts</h1>
          <Link
            href={`/dashboard/shifts?${sortParams}`}
            className="text-xs border border-sun-border rounded-full px-3 py-1.5 text-sun-mute hover:border-sun-accent hover:text-sun-body"
          >
            {asc ? "Oldest first ↑" : "Newest first ↓"}
          </Link>
        </div>



        <div className="space-y-3">
          {active.map((shift) => {
            const allPaid =
              shift.assignments.length > 0 &&
              shift.assignments.every((a) => a.paymentStatus === "paid");

            return (
              <div key={shift.id} className="relative bg-sun-card rounded-[16px] border border-sun-border p-4 hover:border-sun-accent transition-colors">
                <Link href={`/dashboard/shifts/${shift.id}`} className="absolute inset-0 rounded-[16px]" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-sun-ink">{shift.title}</p>
                    <p className="text-sm text-sun-mute mt-0.5">
                      {new Date(shift.shiftDate).toLocaleDateString("en-SG", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {shift.startTime}–{shift.endTime}
                    </p>
                    <p className="text-sm text-sun-mute">
                      {shift.roles.map((r) => `${r.skill.label} ×${r.count}`).join(", ")}
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-2 shrink-0">
                    <ShiftStepBadge status={shift.status} allPaid={allPaid} />
                    {(allPaid || shift.status === "cancelled") && <ArchiveButton shiftId={shift.id} archived={false} />}
                  </div>
                </div>
                {shift.assignments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-sun-border">
                    <div className="flex gap-2 flex-wrap">
                      {shift.assignments.map((a) => (
                        <span key={a.id} className="text-xs bg-sun-inset text-sun-body px-2 py-0.5 rounded-full">
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
            <div className="bg-sun-card rounded-[16px] border border-sun-border p-8 text-center text-sun-mute">
              🌱 No active shifts.
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

      {/* Right: Calendar */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-end mb-0">
          <Link
            href="/dashboard/shifts/new"
            className="bg-sun-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90"
          >
            + New shift
          </Link>
        </div>
        <YearCalendar
          businessId={business.id}
          startYear={calYear}
          startMonth={calMonth}
          skills={skills.map((s) => ({
            id: s.id,
            label: s.label,
            defaultPayType: s.defaultPayType,
            defaultPayRate: s.defaultPayRate ? Number(s.defaultPayRate) : null,
          }))}
          shifts={calendarShifts.map((s) => ({
            id: s.id,
            title: s.title,
            shiftDate: s.shiftDate.toISOString(),
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status,
            roles: s.roles.map((r) => ({
              id: r.id,
              skillId: r.skillId,
              skillLabel: r.skill.label,
              count: r.count,
              payType: r.payType,
              payRate: Number(r.payRate),
            })),
            assignments: s.assignments.map((a) => ({ id: a.id, name: a.partTimer.name })),
          }))}
        />
      </div>
    </div>
  );
}
