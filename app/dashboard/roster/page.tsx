import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { InviteForm } from "./InviteForm";
import { ArchiveRestoreButton } from "./RemoveButton";
import { ArchivedRosterSection } from "./ArchivedRosterSection";
import { Avatar } from "@/components/Avatar";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function nextDateForDay(dayLabel: string): Date {
  const todayJs = new Date().getDay();
  const target = DAY_ORDER.indexOf(dayLabel);
  const todayMon = (todayJs + 6) % 7;
  const daysAhead = (target - todayMon + 7) % 7 || 7;
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

function nextAvailability(availability: { dayOfWeek: string; preference: string }[]): string {
  if (availability.length === 0) return "—";
  const upcoming = availability
    .map((a) => ({ ...a, date: nextDateForDay(a.dayOfWeek) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  const label = upcoming.preference === "morning" ? "AM" : upcoming.preference === "afternoon" ? "PM" : "Flexible";
  return `${upcoming.date.toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" })} · ${label}`;
}

export default async function RosterPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });

  if (!business) return <p className="text-gray-500">No business found.</p>;

  const members = await prisma.rosterMembership.findMany({
    where: { businessId: business.id },
    include: {
      partTimer: {
        include: {
          skills: { where: { businessId: business.id }, include: { skill: true } },
          availability: true,
          assignments: {
            where: { status: { not: "cancelled" }, shift: { businessId: business.id } },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { invitedAt: "desc" },
  });

  const active = members.filter((m) => m.status !== "removed");
  const archived = members.filter((m) => m.status === "removed");
  const activeCount = members.filter((m) => m.status === "active").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Roster</h1>
          <span className="text-sm text-gray-400">{activeCount} active</span>
        </div>
        <InviteForm businessId={business.id} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Skills</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Jobs done</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Next available</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {active.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={m.partTimer.name}
                      avatarEmoji={m.partTimer.avatarEmoji}
                      avatarColor={m.partTimer.avatarColor}
                      id={m.partTimer.id}
                      size="sm"
                    />
                    <div>
                      <Link href={`/dashboard/roster/${m.partTimer.id}`} className="font-medium text-gray-800 hover:text-blue-600">
                        {m.partTimer.name}
                      </Link>
                      <p className="text-xs text-gray-400">{m.partTimer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {m.partTimer.skills.map((s) => s.skill.label).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-800 font-medium">
                  {m.partTimer.assignments.length}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {nextAvailability(m.partTimer.availability)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ArchiveRestoreButton membershipId={m.id} archived={false} />
                </td>
              </tr>
            ))}
            {active.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No employees yet. Invite someone to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ArchivedRosterSection
        members={archived.map((m) => ({
          id: m.id,
          partTimerId: m.partTimerId,
          partTimer: {
            id: m.partTimer.id,
            name: m.partTimer.name,
            email: m.partTimer.email,
            avatarEmoji: m.partTimer.avatarEmoji,
            avatarColor: m.partTimer.avatarColor,
          },
        }))}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    invited: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}
