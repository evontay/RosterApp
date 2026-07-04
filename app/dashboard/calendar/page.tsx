import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { YearCalendar } from "./YearCalendar";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { year, month } = await searchParams;
  const session = await auth();

  const now = new Date();
  const startYear = year ? parseInt(year) : now.getFullYear();
  const startMonth = month !== undefined ? parseInt(month) : now.getMonth(); // 0-indexed

  // Fetch 3-month window (handles year boundaries via JS Date overflow)
  const windowStart = new Date(startYear, startMonth, 1);
  const windowEnd = new Date(startYear, startMonth + 3, 1);

  const [business, skills] = await Promise.all([
    prisma.business.findFirst({ where: { ownerUserId: session!.user.id } }),
    prisma.skill.findMany({
      where: { archived: false },
      orderBy: { label: "asc" },
      select: { id: true, label: true, defaultPayType: true, defaultPayRate: true },
    }),
  ]);
  if (!business) return <p className="text-gray-500">No business found.</p>;

  const shifts = await prisma.shift.findMany({
    where: {
      businessId: business.id,
      shiftDate: { gte: windowStart, lt: windowEnd },
    },
    include: {
      roles: { include: { skill: true } },
      assignments: { include: { partTimer: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <YearCalendar
      businessId={business.id}
      startYear={startYear}
      startMonth={startMonth}
      skills={skills.map((s) => ({
        id: s.id,
        label: s.label,
        defaultPayType: s.defaultPayType,
        defaultPayRate: s.defaultPayRate ? Number(s.defaultPayRate) : null,
      }))}
      shifts={shifts.map((s) => ({
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
  );
}
