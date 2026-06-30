import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AssignForm } from "./AssignForm";
import { HoursForm } from "./HoursForm";
import { MarkPaidButton } from "./MarkPaidButton";
import { ShiftStatusControl } from "./ShiftStatusControl";

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

  const activeMembers = await prisma.rosterMembership.findMany({
    where: { businessId: business.id, status: "active" },
    include: { partTimer: true },
  });

  const assignedIds = new Set(shift.assignments.map((a) => a.partTimerId));
  const assignableMembers = activeMembers.filter((m) => !assignedIds.has(m.partTimerId));

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">{shift.title}</h1>
        <ShiftStatusControl
          shiftId={shift.id}
          currentStatus={shift.status as "draft" | "open" | "filled" | "completed" | "cancelled"}
        />
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {new Date(shift.shiftDate).toLocaleDateString("en-SG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {shift.startTime}–{shift.endTime} · {shift.roles.map((r) => `${r.skill.label} ×${r.count}`).join(", ")} ·{" "}
        {shift.payType === "hourly" ? `$${shift.payRate}/hr` : `$${shift.payRate} flat`}
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Assignments</h2>
          {assignableMembers.length > 0 && (
            <AssignForm shiftId={shift.id} members={assignableMembers} />
          )}
        </div>

        {shift.assignments.length === 0 ? (
          <p className="text-sm text-gray-400">No one assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {shift.assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{a.partTimer.name}</p>
                  <p className="text-xs text-gray-500">
                    {a.hoursLogged != null
                      ? `${a.hoursLogged} hrs · $${a.payAmount}`
                      : "Hours not logged"}
                    {" · "}
                    <span className={a.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}>
                      {a.paymentStatus}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <HoursForm
                    assignmentId={a.id}
                    payType={shift.payType}
                    payRate={Number(shift.payRate)}
                    currentHours={a.hoursLogged ? Number(a.hoursLogged) : null}
                  />
                  {a.paymentStatus === "unpaid" && a.hoursLogged != null && (
                    <MarkPaidButton assignmentId={a.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
