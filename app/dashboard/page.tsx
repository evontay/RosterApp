import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
    include: {
      _count: {
        select: { rosterMembers: true, shifts: true },
      },
    },
  });

  const unpaidCount = business
    ? await prisma.shiftAssignment.count({
        where: {
          shift: { businessId: business.id },
          paymentStatus: "unpaid",
          status: "completed",
        },
      })
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {business?.name ?? "Your Business"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Roster members" value={business?._count.rosterMembers ?? 0} />
        <StatCard label="Total shifts" value={business?._count.shifts ?? 0} />
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
