import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
      assignments: { include: { partTimer: true } },
    },
    orderBy: { shiftDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
        <Link
          href="/dashboard/shifts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + New shift
        </Link>
      </div>

      <div className="space-y-3">
        {shifts.map((shift) => (
          <div key={shift.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-800">{shift.title}</h3>
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
              <div className="flex items-center gap-2">
                <ShiftStatusBadge status={shift.status} />
                <Link
                  href={`/dashboard/shifts/${shift.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Manage
                </Link>
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
        ))}
        {shifts.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
            No shifts yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function ShiftStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-500",
    open: "bg-blue-100 text-blue-700",
    filled: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}
