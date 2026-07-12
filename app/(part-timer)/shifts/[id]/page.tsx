import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function EmployeeShiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
  });
  if (!partTimer) redirect("/login");

  const assignment = await prisma.shiftAssignment.findFirst({
    where: { shiftId: id, partTimerId: partTimer.id },
    include: {
      shift: {
        include: {
          business: true,
          roles: { include: { skill: true } },
        },
      },
      shiftRole: { include: { skill: true } },
    },
  });
  if (!assignment) notFound();

  const { shift } = assignment;

  const shiftDate = new Date(shift.shiftDate).toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <Link href="/my-shifts" className="text-sm text-sun-mute hover:text-sun-body">
        ← My Shifts
      </Link>

      <div className="bg-sun-card rounded-[16px] border border-sun-border p-5 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-sun-ink">{shift.title}</h1>
          <p className="text-sm text-sun-mute mt-1">{shift.business.name}</p>
        </div>

        <div className="border-t border-sun-border pt-4 space-y-2">
          <Row label="Date" value={shiftDate} />
          <Row label="Time" value={`${shift.startTime} – ${shift.endTime}`} />
          {assignment.shiftRole ? (
            <>
              <Row label="Role" value={assignment.shiftRole.skill.label} />
              <Row
                label="Rate"
                value={
                  assignment.shiftRole.payType === "flat_session"
                    ? `$${Number(assignment.shiftRole.payRate).toFixed(2)} flat`
                    : `$${Number(assignment.shiftRole.payRate).toFixed(2)}/hr`
                }
              />
            </>
          ) : shift.roles.length > 0 ? (
            <Row
              label="Roles"
              value={shift.roles.map((r) => r.skill.label).join(", ")}
            />
          ) : null}
        </div>

        <div className="border-t border-sun-border pt-4 space-y-2">
          <Row
            label="Pay"
            value={
              assignment.payAmount != null
                ? `$${Number(assignment.payAmount).toFixed(2)}`
                : "Not yet calculated"
            }
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-sun-mute">Payment status</span>
            <span
              className={`text-sm font-medium ${
                assignment.paymentStatus === "paid" ? "text-status-confirmed-text" : "text-pending-text"
              }`}
            >
              {assignment.paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-sun-mute shrink-0">{label}</span>
      <span className="text-sm text-sun-ink text-right">{value}</span>
    </div>
  );
}
