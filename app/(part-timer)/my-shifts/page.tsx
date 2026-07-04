import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MyShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const asc = sort === "asc";

  const session = await auth();

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session!.user.id },
  });

  if (!partTimer) return <p className="text-gray-500">Profile not found.</p>;

  const assignments = await prisma.shiftAssignment.findMany({
    where: { partTimerId: partTimer.id },
    include: {
      shift: {
        include: { business: true, roles: { include: { skill: true } } },
      },
    },
    orderBy: { shift: { shiftDate: asc ? "asc" : "desc" } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Shifts</h1>
        <Link
          href={`/my-shifts?sort=${asc ? "desc" : "asc"}`}
          className="text-xs border border-gray-300 rounded px-3 py-1.5 text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          Date: {asc ? "Oldest first ↑" : "Newest first ↓"}
        </Link>
      </div>
      <div className="space-y-3">
        {assignments.map((a) => (
          <Link key={a.id} href={`/shifts/${a.shift.id}`} className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">{a.shift.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {a.shift.business.name} ·{" "}
                  {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · {a.shift.startTime}–{a.shift.endTime}
                </p>
                <p className="text-sm text-gray-500">{a.shift.roles.map((r) => r.skill.label).join(", ")}</p>
              </div>
              <div className="text-right text-sm">
                {a.payAmount != null ? (
                  <p className="font-medium text-gray-800">${Number(a.payAmount).toFixed(2)}</p>
                ) : null}
                <span className={`text-xs font-medium ${a.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {a.paymentStatus}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {assignments.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
            No shifts assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}
