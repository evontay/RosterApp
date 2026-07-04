import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AssignForm } from "./AssignForm";
import { HoursForm } from "./HoursForm";
import { MarkAllPaidButton } from "./MarkAllPaidButton";
import { UnassignButton } from "./UnassignButton";
import { ShiftActionsMenu } from "./ShiftActionsMenu";
import { ShiftProgress } from "../ShiftProgress";

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
    where: { archived: false },
    orderBy: { label: "asc" },
    select: { id: true, label: true, defaultPayType: true, defaultPayRate: true },
  });

  const activeMembers = await prisma.rosterMembership.findMany({
    where: { businessId: business.id, status: "active" },
    include: { partTimer: true },
  });

  const activeAssignments = shift.assignments.filter((a) => a.status !== "cancelled");
  const assignedIds = new Set(activeAssignments.map((a) => a.partTimerId));
  const assignableMembers = activeMembers.filter((m) => !assignedIds.has(m.partTimerId));

  const roleOptions = shift.roles.map((r) => ({
    label: r.skill.label,
    payType: r.payType,
    payRate: Number(r.payRate),
  }));

  const allPaid = activeAssignments.length > 0 && activeAssignments.every((a) => a.paymentStatus === "paid");
  const hasUnpaid = activeAssignments.some((a) => a.paymentStatus === "unpaid");

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">{shift.title}</h1>
        <ShiftActionsMenu
          shiftId={shift.id}
          currentStatus={shift.status as "draft" | "open" | "filled" | "completed" | "cancelled"}
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
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(shift.shiftDate).toLocaleDateString("en-SG", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        })}{" "}
        · {shift.startTime}–{shift.endTime}
      </p>

      <div className="mb-6">
        <ShiftProgress status={shift.status} allPaid={allPaid} />
      </div>

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
          <div className="flex items-center gap-2">
            {shift.status === "completed" && hasUnpaid && (
              <MarkAllPaidButton shiftId={shift.id} />
            )}
            {assignableMembers.length > 0 && (
              <AssignForm shiftId={shift.id} members={assignableMembers} />
            )}
          </div>
        </div>

        {activeAssignments.length === 0 ? (
          <p className="text-sm text-gray-400">No one assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {activeAssignments.map((a) => (
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
