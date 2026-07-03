import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SkillEditor } from "./SkillEditor";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function PartTimerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });
  if (!business) notFound();

  const [membership, allSkills] = await Promise.all([
    prisma.rosterMembership.findFirst({
      where: { partTimerId: id, businessId: business.id },
      include: {
        partTimer: {
          include: {
            skills: {
              where: { businessId: business.id },
              include: { skill: true },
            },
            availability: true,
          },
        },
      },
    }),
    prisma.skill.findMany({ orderBy: { label: "asc" }, select: { id: true, label: true } }),
  ]);
  if (!membership) notFound();

  const assignments = await prisma.shiftAssignment.findMany({
    where: { partTimerId: id, shift: { businessId: business.id }, status: { not: "cancelled" } },
    include: {
      shift: { include: { roles: { include: { skill: true } } } },
    },
    orderBy: { shift: { shiftDate: "desc" } },
  });

  const { partTimer } = membership;

  const totalEarned = assignments.reduce(
    (sum, a) => sum + (a.payAmount ? Number(a.payAmount) : 0), 0
  );
  const totalPaid = assignments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((sum, a) => sum + (a.payAmount ? Number(a.payAmount) : 0), 0);
  const totalOwed = totalEarned - totalPaid;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/roster" className="text-sm text-gray-400 hover:text-gray-600">
          ← Roster
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{partTimer.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {partTimer.email}{partTimer.phone ? ` · ${partTimer.phone}` : ""}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          membership.status === "active" ? "bg-green-100 text-green-700" :
          membership.status === "invited" ? "bg-yellow-100 text-yellow-700" :
          "bg-gray-100 text-gray-500"
        }`}>
          {membership.status}
        </span>
      </div>

      {/* Skills & Availability */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Skills</h2>
          <SkillEditor
            partTimerId={id}
            allSkills={allSkills}
            currentSkillIds={partTimer.skills.map((s) => s.skillId)}
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Availability</h2>
          {partTimer.availability.length > 0 ? (
            <div className="space-y-1">
              {DAYS.filter((d) => partTimer.availability.find((a) => a.dayOfWeek === d)).map((d) => {
                const a = partTimer.availability.find((a) => a.dayOfWeek === d)!;
                return (
                  <div key={d} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-8 font-medium text-gray-800">{d}</span>
                    <span>{a.startTime}–{a.endTime}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No availability set</p>
          )}
        </div>
      </div>

      {/* Pay summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Shifts worked</p>
          <p className="text-xl font-bold text-gray-800">{assignments.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total earned</p>
          <p className="text-xl font-bold text-gray-800">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Outstanding</p>
          <p className={`text-xl font-bold ${totalOwed > 0 ? "text-yellow-600" : "text-gray-800"}`}>
            ${totalOwed.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Shift history */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Shift history</h2>
        </div>
        {assignments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">No shifts yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignments.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <Link
                    href={`/dashboard/shifts/${a.shift.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-blue-600"
                  >
                    {a.shift.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", {
                      weekday: "short", day: "numeric", month: "short", year: "numeric",
                    })}{" "}
                    · {a.shift.startTime}–{a.shift.endTime}
                    {a.hoursLogged != null ? ` · ${a.hoursLogged} hrs` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {a.payAmount != null ? (
                    <p className="text-sm font-medium text-gray-800">${Number(a.payAmount).toFixed(2)}</p>
                  ) : (
                    <p className="text-xs text-gray-400">Not logged</p>
                  )}
                  <span className={`text-xs font-medium ${a.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {a.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
