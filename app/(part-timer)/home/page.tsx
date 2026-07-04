import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";

export default async function EmployeeHomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    include: {
      memberships: { orderBy: { invitedAt: "asc" }, take: 1 },
    },
  });
  if (!partTimer) redirect("/login");

  const activeAssignments = await prisma.shiftAssignment.findMany({
    where: {
      partTimerId: partTimer.id,
      status: "assigned",
    },
    include: {
      shift: {
        include: { business: true, roles: { include: { skill: true } } },
      },
    },
    orderBy: { shift: { shiftDate: "asc" } },
  });

  const memberSince = partTimer.memberships[0]?.invitedAt ?? null;

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-5">
          <Avatar
            name={partTimer.name}
            avatarEmoji={partTimer.avatarEmoji}
            avatarColor={partTimer.avatarColor}
            id={partTimer.id}
            size="lg"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-800">{partTimer.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{partTimer.email}</p>
            {partTimer.phone && (
              <p className="text-sm text-gray-500">{partTimer.phone}</p>
            )}
            {memberSince && (
              <p className="text-xs text-gray-400 mt-1">
                Member since{" "}
                {memberSince.toLocaleDateString("en-SG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/my-settings"
            className="text-sm text-blue-600 hover:underline"
          >
            Edit profile →
          </Link>
        </div>
      </div>

      {/* Active shifts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Active shifts
        </h2>
        <div className="space-y-3">
          {activeAssignments.map((a) => (
            <Link
              key={a.id}
              href={`/shifts/${a.shift.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
            >
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
                  <p className="text-sm text-gray-500">
                    {a.shift.roles.map((r) => r.skill.label).join(", ")}
                  </p>
                </div>
                {a.payAmount != null && (
                  <p className="text-sm font-medium text-gray-800">
                    ${Number(a.payAmount).toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {activeAssignments.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-400 text-sm">
              No active shifts right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
