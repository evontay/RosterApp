import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { InviteForm } from "./InviteForm";
import { RemoveButton } from "./RemoveButton";

export default async function RosterPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });

  if (!business) return <p className="text-gray-500">No business found.</p>;

  const members = await prisma.rosterMembership.findMany({
    where: { businessId: business.id },
    include: {
      partTimer: { include: { skills: { include: { skill: true } } } },
    },
    orderBy: { invitedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Roster</h1>
        <InviteForm businessId={business.id} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Skills</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-800">
                  <Link href={`/dashboard/roster/${m.partTimer.id}`} className="hover:text-blue-600">
                    {m.partTimer.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{m.partTimer.email}</td>
                <td className="px-4 py-3 text-gray-600">
                  {m.partTimer.skills.map((s) => s.skill.label).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {m.status !== "removed" && <RemoveButton membershipId={m.id} />}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No roster members yet. Invite someone to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    invited: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    removed: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}
