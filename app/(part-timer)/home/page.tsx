import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { computeTrustSignals } from "@/lib/trust";


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

  const objectiveRecords = await prisma.objectiveRecord.findMany({
    where: { partTimerId: partTimer.id },
    select: { attendance: true, qualityFlag: true, createdAt: true },
  });
  const performance = computeTrustSignals(
    objectiveRecords.map((r) => ({
      attendance: r.attendance as "attended" | "late" | "no_show",
      qualityFlag: r.qualityFlag as "good" | "issues" | null,
      createdAt: r.createdAt,
    }))
  );

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

      {/* Performance */}
      {performance.recordCount > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Your performance</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Reliability</p>
              <p className={`text-2xl font-bold ${
                performance.reliability !== null && performance.reliability >= 80 ? "text-green-600" :
                performance.reliability !== null && performance.reliability >= 60 ? "text-yellow-600" :
                "text-red-500"
              }`}>
                {performance.reliability !== null ? `${performance.reliability}%` : "—"}
              </p>
              {performance.reliability !== null && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      performance.reliability >= 80 ? "bg-green-500" :
                      performance.reliability >= 60 ? "bg-yellow-400" : "bg-red-400"
                    }`}
                    style={{ width: `${performance.reliability}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Quality</p>
              {performance.quality !== null ? (
                <>
                  <p className={`text-2xl font-bold ${
                    performance.quality >= 80 ? "text-green-600" :
                    performance.quality >= 60 ? "text-yellow-600" : "text-red-500"
                  }`}>
                    {performance.quality}%
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        performance.quality >= 80 ? "bg-green-500" :
                        performance.quality >= 60 ? "bg-yellow-400" : "bg-red-400"
                      }`}
                      style={{ width: `${performance.quality}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Not yet rated</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Based on {performance.recordCount} completed shift{performance.recordCount !== 1 ? "s" : ""}.</p>
        </div>
      )}

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
