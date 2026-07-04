import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_DOT: Record<string, string> = {
  draft: "bg-gray-400",
  open: "bg-blue-500",
  filled: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-400",
};
const STATUS_ORDER = ["draft", "open", "filled", "completed", "cancelled"] as const;

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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {business.name}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active employees" value={activeRosterCount} />
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total shifts</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalShifts}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-sm ${STATUS_DOT[status]}`} />
                <span className="text-xs text-gray-500 capitalize">{status}</span>
                <span className="text-xs text-gray-400">({statusCounts[status] ?? 0})</span>
              </div>
            ))}
          </div>
        </div>
        <StatCard label="Unpaid completed shifts" value={unpaidCount} />
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
