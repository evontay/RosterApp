import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AssignForm } from "./AssignForm";
import { HoursForm } from "./HoursForm";
import { MarkPaidButton } from "./MarkPaidButton";
import { ShiftStatusControl } from "./ShiftStatusControl";
import { UnassignButton } from "./UnassignButton";
import { EditShiftForm } from "./EditShiftForm";

export default async function ShiftDetailPage({
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

  const shift = await prisma.shift.findFirst({
    where: { id, businessId: business.id },
    include: {
      roles: { include: { skill: true } },
      assignments: { include: { partTimer: true } },
    },
  });
  if (!shift) notFound();

  const skills = await prisma.skill.findMany({
    orderBy: { label: "asc" },
    select: { id: true, label: true, defaultPayType: true, defaultPayRate: true },
  });

  const activeMembers = await prisma.rosterMembership.findMany({
    where: { businessId: business.id, status: "active" },
    include: { partTimer: true },
  });

  const assignedIds = new Set(
    shift.assignments.filter((a) => a.status !== "cancelled").map((a) => a.partTimerId)
  );
  const assignableMembers = activeMembers.filter((m) => !assignedIds.has(m.partTimerId));

  const roleOptions = shift.roles.map((r) => ({
    label: r.skill.label,
    payType: r.payType,
    payRate: Number(r.payRate),
  }));

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">{shift.title}</h1>
        <div className="flex items-center gap-2">
          <EditShiftForm
            shift={{
              id: shift.id,
              title: shift.title,
              shiftDate: shift.shiftDate.toISOString(),
              startTime: shift.startTime,
              endTime: shift.endTime,
              roles: shift.roles.map((r) => ({
                skillId: r.skillId,
                count: r.count,
                payType: r.payType,
                payRate: Number(r.payRate),
              })),
            }}
            skills={skills.map((s) => ({
              id: s.id,
              label: s.label,
              defaultPayType: s.defaultPayType,
              defaultPayRate: s.defaultPayRate ? Number(s.defaultPayRate) : null,
            }))}
          />
          <ShiftStatusControl
            shiftId={shift.id}
            currentStatus={shift.status as "draft" | "open" | "filled" | "completed" | "cancelled"}
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {new Date(shift.shiftDate).toLocaleDateString("en-SG", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        })}{" "}
        · {shift.startTime}–{shift.endTime}
      </p>

      {/* Roles summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        {shift.roles.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <span className="font-medium text-gray-800">{r.skill.label}</span>
            <span className="text-gray-400 mx-1">×{r.count}</span>
            <span className="text-gray-500">
              {r.payType === "hourly" ? `$${Number(r.payRate)}/hr` : `$${Number(r.payRate)} flat`}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Assignments</h2>
          {assignableMembers.length > 0 && (
            <AssignForm shiftId={shift.id} members={assignableMembers} />
          )}
        </div>

        {shift.assignments.filter((a) => a.status !== "cancelled").length === 0 ? (
          <p className="text-sm text-gray-400">No one assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {shift.assignments.filter((a) => a.status !== "cancelled").map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{a.partTimer.name}</p>
                  <p className="text-xs text-gray-500">
                    {a.hoursLogged != null ? `${a.hoursLogged} hrs · $${a.payAmount}` : "Hours not logged"}
                    {" · "}
                    <span className={a.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}>
                      {a.paymentStatus}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <HoursForm
                    assignmentId={a.id}
                    roles={roleOptions}
                    currentHours={a.hoursLogged ? Number(a.hoursLogged) : null}
                  />
                  {a.paymentStatus === "unpaid" && a.hoursLogged != null && (
                    <MarkPaidButton assignmentId={a.id} />
                  )}
                  <UnassignButton assignmentId={a.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
