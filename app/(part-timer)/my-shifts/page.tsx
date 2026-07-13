import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const SHIFT_EMOJIS = ["🎨", "🏺", "📦", "✂️", "🕯️", "🧶", "🌿", "🎸", "🌸", "🧑‍🎨"];
const SHIFT_BGS = ["#FDE68A", "#DBEAFE", "#D1FAE5", "#E9D5FF", "#FCE7F3"];

function getShiftIcon(title: string, id: string): { emoji: string; bg: string } {
  const code0 = id.charCodeAt(0) || 0;
  const code1 = id.charCodeAt(1) || 0;
  return {
    emoji: SHIFT_EMOJIS[code0 % SHIFT_EMOJIS.length],
    bg: SHIFT_BGS[code1 % SHIFT_BGS.length],
  };
}

export default async function MyShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const asc = sort === "asc";

  const session = await auth();

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session!.user.id },
  });

  if (!partTimer) return <p className="text-sun-mute">Profile not found.</p>;

  const assignments = await prisma.shiftAssignment.findMany({
    where: { partTimerId: partTimer.id, status: { not: "cancelled" } },
    include: {
      shift: { include: { business: true } },
      shiftRole: { include: { skill: true } },
    },
    orderBy: { shift: { shiftDate: asc ? "asc" : "desc" } },
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-sun-ink">My Shifts</h1>
        <Link
          href={`/my-shifts?sort=${asc ? "desc" : "asc"}`}
          className="text-xs border border-sun-border rounded-full px-3 py-1.5 text-sun-mute hover:border-sun-accent hover:text-sun-body"
        >
          Date: {asc ? "Oldest first ↑" : "Newest first ↓"}
        </Link>
      </div>
      <div className="space-y-3">
        {assignments.map((a) => {
          const { emoji, bg } = getShiftIcon(a.shift.title, a.shift.id);
          return (
            <Link key={a.id} href={`/shifts/${a.shift.id}`} className="block bg-sun-card rounded-[16px] border border-sun-border p-4 hover:border-sun-accent transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div
                  style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}
                >
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sun-ink">{a.shift.title}</p>
                  <p className="text-sm text-sun-mute mt-0.5">
                    {new Date(a.shift.shiftDate).toLocaleDateString("en-SG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {a.shift.startTime}–{a.shift.endTime}
                  </p>
                  {a.shiftRole && (
                    <p className="text-xs text-sun-mute mt-0.5">{a.shiftRole.skill.label}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {a.payAmount != null ? (
                    <p className="text-sm font-medium text-sun-accent-link">${Number(a.payAmount).toFixed(2)}</p>
                  ) : (
                    <p className="text-xs text-sun-mute">Not logged</p>
                  )}
                  <span className={`text-xs font-medium ${a.paymentStatus === "paid" ? "text-status-confirmed-text" : "text-pending-text"}`}>
                    {a.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {assignments.length === 0 && (
          <div className="bg-sun-card rounded-[16px] border border-sun-border p-8 text-center text-sun-mute">
            🌱 No shifts assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}
