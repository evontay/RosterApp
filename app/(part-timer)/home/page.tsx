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
      skills: { include: { skill: true } },
    },
  });
  if (!partTimer) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAssignments = await prisma.shiftAssignment.findMany({
    where: {
      partTimerId: partTimer.id,
      status: "assigned",
      shift: { shiftDate: { gte: today }, status: { not: "cancelled" } },
    },
    include: {
      shift: {
        include: { business: true },
      },
      shiftRole: { include: { skill: true } },
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
          <div className="min-w-0 flex-1">
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
            {partTimer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {partTimer.skills.map((s) => (
                  <span key={s.skillId} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {s.skill.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <Link href="/my-settings" className="text-sm text-blue-600 hover:underline">
            Edit profile →
          </Link>
        </div>
      </div>

      {/* Upcoming shifts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Upcoming shifts
        </h2>
        <div className="space-y-3">
          {upcomingAssignments.map((a) => (
            <Link
              key={a.id}
              href={`/shifts/${a.shift.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800">{a.shift.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {a.shift.startTime}–{a.shift.endTime}
                  </p>
                  {a.shiftRole && (
                    <p className="text-xs text-gray-400 mt-0.5">{a.shiftRole.skill.label}</p>
                  )}
                </div>
                {a.payAmount != null && (
                  <p className="text-sm font-semibold text-gray-800 shrink-0">
                    ${Number(a.payAmount).toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {upcomingAssignments.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-400 text-sm">
              No upcoming shifts.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
