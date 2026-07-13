import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";

const STATUS_STYLE: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  open:      { label: "Open",      dot: "bg-status-open-dot",       bg: "bg-status-open-bg",       text: "text-status-open-text" },
  filled:    { label: "Confirmed", dot: "bg-status-confirmed-dot",  bg: "bg-status-confirmed-bg",  text: "text-status-confirmed-text" },
  completed: { label: "Logged",    dot: "bg-status-logged-dot",     bg: "bg-status-logged-bg",     text: "text-status-logged-text" },
};
const STATUS_ORDER = ["open", "filled", "completed"] as const;

export default async function DashboardPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });
  if (!business) return <p className="text-sun-mute">No business found.</p>;

  // Derive a first name from the owner's email (e.g. "evon@…" → "Evon")
  const ownerEmail = session!.user.email ?? "";
  const ownerFirstName = ownerEmail.split("@")[0].split(".")[0];
  const ownerDisplayName = ownerFirstName.charAt(0).toUpperCase() + ownerFirstName.slice(1);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);

  const [
    activeRosterCount,
    shiftsThisMonth,
    shiftStatusGroups,
    openShifts,
    pendingInterests,
    upcomingShifts,
    unpaidAssignments,
    unreadActivityCount,
  ] = await Promise.all([
    prisma.rosterMembership.count({
      where: { businessId: business.id, status: "active" },
    }),
    prisma.shift.count({
      where: { businessId: business.id, shiftDate: { gte: startOfMonth, lt: endOfMonth }, status: { not: "cancelled" } },
    }),
    prisma.shift.groupBy({
      by: ["status"],
      where: { businessId: business.id, archived: false },
      _count: { id: true },
    }),
    // Open shifts with unfilled slots
    prisma.shift.findMany({
      where: { businessId: business.id, status: "open", archived: false },
      include: {
        roles: {
          include: {
            assignments: { where: { status: { not: "cancelled" } }, select: { id: true } },
          },
        },
      },
      orderBy: { shiftDate: "asc" },
    }),
    // Pending interests awaiting decision
    prisma.shiftInterest.findMany({
      where: { status: "pending", shift: { businessId: business.id } },
      include: {
        shift: { select: { id: true, title: true, shiftDate: true } },
        partTimer: { select: { id: true, name: true, avatarEmoji: true, avatarColor: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Upcoming shifts in next 7 days
    prisma.shift.findMany({
      where: {
        businessId: business.id,
        shiftDate: { gte: today, lte: in7Days },
        status: { not: "cancelled" },
        archived: false,
      },
      include: {
        roles: {
          include: {
            assignments: { where: { status: { not: "cancelled" } }, select: { id: true } },
          },
        },
      },
      orderBy: { shiftDate: "asc" },
    }),
    // Unpaid assignments on logged shifts
    prisma.shiftAssignment.findMany({
      where: {
        shift: { businessId: business.id, status: "completed" },
        paymentStatus: "unpaid",
        status: { not: "cancelled" },
      },
      include: {
        partTimer: { select: { id: true, name: true, avatarEmoji: true, avatarColor: true } },
        shift: { select: { id: true, title: true, shiftDate: true } },
      },
      orderBy: { shift: { shiftDate: "asc" } },
    }),
    // Unread activity notifications
    prisma.activity.count({
      where: { recipientId: session!.user.id, read: false },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    shiftStatusGroups.map((g) => [g.status, g._count.id])
  );

  const owedTotal = unpaidAssignments.reduce((sum, a) => sum + (a.payAmount ? Number(a.payAmount) : 0), 0);

  // Shifts with at least one unfilled slot
  const understaffedShifts = openShifts.filter((s) =>
    s.roles.some((r) => r.assignments.length < r.count)
  ).map((s) => ({
    id: s.id,
    title: s.title,
    shiftDate: s.shiftDate,
    emptySlots: s.roles.reduce((sum, r) => sum + Math.max(0, r.count - r.assignments.length), 0),
  }));

  // Group pending interests by shift
  const interestsByShift = new Map<string, { shift: typeof pendingInterests[0]["shift"]; people: typeof pendingInterests }>();
  for (const i of pendingInterests) {
    const key = i.shift.id;
    if (!interestsByShift.has(key)) interestsByShift.set(key, { shift: i.shift, people: [] });
    interestsByShift.get(key)!.people.push(i);
  }
  const interestGroups = [...interestsByShift.values()];


  const hasAttentionItems = understaffedShifts.length > 0 || interestGroups.length > 0 || unpaidAssignments.length > 0;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="mb-4">
        <h1 className="text-lg font-medium text-sun-ink">Good morning, {ownerDisplayName}</h1>
        <p className="text-xs text-sun-mute">{new Date().toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active employees" value={activeRosterCount} />
        <StatCard
          label="Shifts this month"
          value={shiftsThisMonth}
          href={`/dashboard/shifts?year=${now.getFullYear()}&month=${now.getMonth()}`}
        />
        <StatCard label="Owed to crew" value={owedTotal} money />
        <div className="grid grid-cols-3 col-span-4 gap-3">
          {STATUS_ORDER.map((status) => {
            const count = statusCounts[status] ?? 0;
            const s = STATUS_STYLE[status];
            return (
              <div key={status} className={`rounded-[12px] border border-sun-border p-4 ${s.bg}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} aria-hidden="true" />
                  <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.text}`}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unread activity */}
      {unreadActivityCount > 0 && (
        <Link
          href="/dashboard/activity"
          className="flex items-center justify-between bg-sun-accent-soft border border-sun-border rounded-[16px] px-4 py-3 hover:border-sun-accent transition-colors"
        >
          <p className="text-sm font-medium text-sun-accent-text">
            🔔 {unreadActivityCount} new notification{unreadActivityCount !== 1 ? "s" : ""}
          </p>
          <span className="text-xs text-sun-accent-link">View activity →</span>
        </Link>
      )}

      {/* Needs attention */}
      {hasAttentionItems && (
        <section>
          <h2 className="text-sm font-semibold text-sun-mute uppercase tracking-wide mb-3">Needs attention</h2>
          <div className="space-y-3">

            {/* Understaffed shifts */}
            {understaffedShifts.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/shifts/${s.id}`}
                className="flex items-center justify-between bg-sun-card rounded-[16px] border border-sun-border px-4 py-3 hover:border-sun-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-sun-ink">{s.title}</p>
                  <p className="text-xs text-sun-mute mt-0.5">
                    {new Date(s.shiftDate).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-status-open-bg text-status-open-text rounded-full shrink-0">
                  {s.emptySlots} slot{s.emptySlots !== 1 ? "s" : ""} unfilled
                </span>
              </Link>
            ))}

            {/* Pending interests */}
            {interestGroups.map(({ shift, people }) => (
              <Link
                key={shift.id}
                href={`/dashboard/shifts/${shift.id}`}
                className="flex items-center justify-between bg-sun-card rounded-[16px] border border-sun-border px-4 py-3 hover:border-sun-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-sun-ink">{shift.title}</p>
                  <p className="text-xs text-sun-mute mt-0.5">
                    {new Date(shift.shiftDate).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" })}
                    {" · "}
                    {people.map((p) => p.partTimer.name).join(", ")}
                  </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-status-logged-bg text-status-logged-text rounded-full shrink-0">
                  {people.length} raised hands
                </span>
              </Link>
            ))}

            {/* Unpaid assignments */}
            {unpaidAssignments.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/shifts/${a.shift.id}`}
                className="flex items-center justify-between bg-sun-card rounded-[16px] border border-sun-border px-4 py-3 hover:border-sun-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={a.partTimer.name}
                    avatarEmoji={a.partTimer.avatarEmoji}
                    avatarColor={a.partTimer.avatarColor}
                    id={a.partTimer.id}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-sun-ink">{a.partTimer.name}</p>
                    <p className="text-xs text-sun-mute">
                      {a.shift.title} · {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-status-paid-bg text-status-paid-text rounded-full shrink-0">
                  {a.payAmount != null ? `$${Number(a.payAmount).toFixed(2)} unpaid` : "Unpaid"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming shifts — next 7 days */}
      <section>
        <h2 className="text-sm font-semibold text-sun-mute uppercase tracking-wide mb-3">Next 7 days</h2>
        {upcomingShifts.length === 0 ? (
          <p className="text-sm text-sun-mute">🌱 No shifts in the next 7 days.</p>
        ) : (
          <div className="bg-sun-card rounded-[16px] border border-sun-border divide-y divide-sun-border">
            {upcomingShifts.map((s) => {
              const totalSlots = s.roles.reduce((sum, r) => sum + r.count, 0);
              const filledSlots = s.roles.reduce((sum, r) => sum + r.assignments.length, 0);
              const full = filledSlots >= totalSlots && totalSlots > 0;
              return (
                <Link
                  key={s.id}
                  href={`/dashboard/shifts/${s.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-sun-inset transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-sun-ink">{s.title}</p>
                    <p className="text-xs text-sun-mute mt-0.5">
                      {new Date(s.shiftDate).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}{s.startTime}–{s.endTime}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                    full ? "bg-status-confirmed-bg text-status-confirmed-text" : "bg-status-open-bg text-status-open-text"
                  }`}>
                    {filledSlots}/{totalSlots} staffed
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, href, money }: { label: string; value: number; href?: string; money?: boolean }) {
  const displayValue = money ? `$${value.toFixed(0)}` : value;
  const content = (
    <>
      <p className="text-sm text-sun-mute">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${money ? "text-sun-accent-link" : "text-sun-ink"}`}>{displayValue}</p>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="block bg-sun-card rounded-[12px] border border-sun-border p-5 hover:border-sun-accent transition-colors">
        {content}
      </Link>
    );
  }
  return <div className="bg-sun-card rounded-[12px] border border-sun-border p-5">{content}</div>;
}
