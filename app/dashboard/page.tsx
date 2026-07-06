import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_STYLE: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  open:      { label: "Open",      dot: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700" },
  filled:    { label: "Confirmed", dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  completed: { label: "Logged",    dot: "bg-green-500",  bg: "bg-green-50",  text: "text-green-700" },
  cancelled: { label: "Cancelled", dot: "bg-red-400",    bg: "bg-red-50",    text: "text-red-600" },
};
const STATUS_ORDER = ["open", "filled", "completed"] as const;

export default async function DashboardPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });

  if (!business) return <p className="text-gray-500">No business found.</p>;

  const [activeRosterCount, unpaidCount, shiftStatusGroups] = await Promise.all([
    prisma.rosterMembership.count({
      where: { businessId: business.id, status: "active" },
    }),
    prisma.shiftAssignment.count({
      where: {
        shift: { businessId: business.id },
        paymentStatus: "unpaid",
        status: "completed",
      },
    }),
    prisma.shift.groupBy({
      by: ["status"],
      where: { businessId: business.id },
      _count: { id: true },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    shiftStatusGroups.map((g) => [g.status, g._count.id])
  );
  const totalShifts = shiftStatusGroups.reduce((sum, g) => sum + g._count.id, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">{business.name}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active employees" value={activeRosterCount} />
        <StatCard label="Total shifts" value={totalShifts} />
        <StatCard label="Unpaid completed shifts" value={unpaidCount} />
      </div>

      {/* Shift status breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Shifts by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STATUS_ORDER.map((status) => {
            const count = statusCounts[status] ?? 0;
            const s = STATUS_STYLE[status];
            return (
              <div key={status} className={`rounded-lg border border-gray-200 p-4 ${s.bg}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-sm ${s.dot}`} />
                  <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.text}`}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
