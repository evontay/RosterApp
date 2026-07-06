import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BackLink } from "./BackLink";
import { AssignForm } from "./AssignForm";
import { HoursForm } from "./HoursForm";
import { MarkAllPaidButton } from "./MarkAllPaidButton";
import { UnassignButton } from "./UnassignButton";
import { ShiftActionsMenu } from "./ShiftActionsMenu";
import { ShiftProgress } from "../ShiftProgress";
import { Avatar } from "@/components/Avatar";
import { InterestActions } from "./InterestActions";
import { EmployeeProfileModal } from "./EmployeeProfileModal";

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
      roles: {
        include: {
          skill: true,
          assignments: {
            where: { status: { not: "cancelled" } },
            include: {
              partTimer: {
                include: {
                  skills: { where: { businessId: business.id }, include: { skill: true } },
                  assignments: {
                    where: { status: "completed", shift: { businessId: business.id } },
                    select: { id: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  if (!shift) notFound();

  const skills = await prisma.skill.findMany({
    where: { archived: false },
    orderBy: { label: "asc" },
    select: { id: true, label: true, defaultPayType: true, defaultPayRate: true },
  });

  const pendingInterests = await prisma.shiftInterest.findMany({
    where: { shiftId: id, status: "pending" },
    include: {
      partTimer: {
        include: {
          skills: { where: { businessId: business.id }, include: { skill: true } },
          assignments: {
            where: { status: "completed", shift: { businessId: business.id } },
            select: { id: true },
          },
        },
      },
      shiftRole: { include: { skill: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const activeMembers = await prisma.rosterMembership.findMany({
    where: { businessId: business.id, status: "active" },
    include: {
      partTimer: {
        include: { skills: { where: { businessId: business.id } } },
      },
    },
    orderBy: { partTimer: { name: "asc" } },
  });

  // Default hours from shift duration
  function parseTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  }
  const defaultHours = Math.round((parseTime(shift.endTime) - parseTime(shift.startTime)) * 10) / 10;

  // All assigned employee IDs across the whole shift (one person = one slot max)
  const allActiveAssignments = shift.roles.flatMap((r) => r.assignments);
  const allAssignedIds = new Set(allActiveAssignments.map((a) => a.partTimerId));
  // Unassigned members — filtered per role by skill below
  const unassignedMembers = activeMembers.filter((m) => !allAssignedIds.has(m.partTimerId));

  const allPaid =
    allActiveAssignments.length > 0 &&
    allActiveAssignments.every((a) => a.paymentStatus === "paid");
  const hasUnpaid = allActiveAssignments.some((a) => a.paymentStatus === "unpaid");

  return (
    <div className="max-w-2xl">
      <BackLink />
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">{shift.title}</h1>
        <ShiftActionsMenu
          shiftId={shift.id}
          currentStatus={shift.status as "open" | "filled" | "completed" | "cancelled"}
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

      {/* Staffing */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Staffing</h2>
          {shift.status === "completed" && hasUnpaid && (
            <MarkAllPaidButton shiftId={shift.id} />
          )}
        </div>

        <div className="space-y-5">
          {shift.roles.map((role) => {
            const filled = role.assignments;
            const emptySlots = role.count - filled.length;
            const payDisplay =
              role.payType === "hourly"
                ? `$${Number(role.payRate)}/hr`
                : `$${Number(role.payRate)} flat`;
            const roleAssignableMembers = unassignedMembers.filter((m) =>
              m.partTimer.skills.some((s) => s.skillId === role.skillId)
            );

            return (
              <div key={role.id}>
                {/* Role header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-800">{role.skill.label}</span>
                  <span className="text-xs text-gray-400">
                    {filled.length}/{role.count} filled · {payDisplay}
                  </span>
                </div>

                {/* Filled slots */}
                <div className="space-y-2 mb-2">
                  {filled.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={a.partTimer.name}
                          avatarEmoji={a.partTimer.avatarEmoji}
                          avatarColor={a.partTimer.avatarColor}
                          id={a.partTimer.id}
                          size="sm"
                        />
                        <div>
                          <EmployeeProfileModal
                            partTimer={{
                              id: a.partTimer.id,
                              name: a.partTimer.name,
                              email: a.partTimer.email,
                              phone: a.partTimer.phone,
                              avatarEmoji: a.partTimer.avatarEmoji,
                              avatarColor: a.partTimer.avatarColor,
                              skills: a.partTimer.skills.map((s) => s.skill.label),
                              completedJobs: a.partTimer.assignments.length,
                            }}
                          />
                          <p className="text-xs text-gray-500">
                            {a.payAmount != null
                              ? (a.hoursLogged != null ? `${a.hoursLogged} hrs · ` : "") + `$${Number(a.payAmount).toFixed(2)}`
                              : role.payType === "flat_session" ? "Pending confirmation" : "Hours not logged"}
                            {" · "}
                            <span className={a.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}>
                              {a.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <HoursForm
                          assignmentId={a.id}
                          payType={role.payType}
                          payRate={Number(role.payRate)}
                          currentHours={a.hoursLogged ? Number(a.hoursLogged) : null}
                          defaultHours={defaultHours}
                        />
                        <UnassignButton assignmentId={a.id} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty slots */}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 border border-dashed border-gray-200 rounded-lg mb-2"
                  >
                    <span className="text-xs text-gray-400">Empty slot</span>
                    {roleAssignableMembers.length > 0 ? (
                      <AssignForm
                        shiftId={shift.id}
                        shiftRoleId={role.id}
                        members={roleAssignableMembers}
                      />
                    ) : (
                      <span className="text-xs text-gray-300">No matching employees</span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interested employees */}
      {pendingInterests.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">
            Interested <span className="text-gray-400 font-normal text-sm">({pendingInterests.length})</span>
          </h2>
          <div className="space-y-3">
            {pendingInterests.map((interest) => {
              const roleOptions = shift.roles
                .filter((r) => {
                  const filledCount = r.assignments.length;
                  return filledCount < r.count && !allAssignedIds.has(interest.partTimerId);
                })
                .map((r) => ({ id: r.id, label: r.skill.label }));

              return (
                <div key={interest.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={interest.partTimer.name}
                      avatarEmoji={interest.partTimer.avatarEmoji}
                      avatarColor={interest.partTimer.avatarColor}
                      id={interest.partTimer.id}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <EmployeeProfileModal
                        partTimer={{
                          id: interest.partTimer.id,
                          name: interest.partTimer.name,
                          email: interest.partTimer.email,
                          phone: interest.partTimer.phone,
                          avatarEmoji: interest.partTimer.avatarEmoji,
                          avatarColor: interest.partTimer.avatarColor,
                          skills: interest.partTimer.skills.map((s) => s.skill.label),
                          completedJobs: interest.partTimer.assignments.length,
                        }}
                      />
                      {interest.comment && (
                        <p className="text-xs text-gray-400 italic truncate">"{interest.comment}"</p>
                      )}
                    </div>
                  </div>
                  <InterestActions
                    interestId={interest.id}
                    preferredRoleId={interest.shiftRoleId}
                    roleOptions={roleOptions}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
