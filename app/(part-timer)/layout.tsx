import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PartTimerNavLinks } from "./PartTimerNavLinks";

export default async function PartTimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "part_timer") redirect("/dashboard");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      avatarEmoji: true,
      avatarColor: true,
      memberships: { where: { status: "active" }, select: { businessId: true } },
    },
  });
  if (!partTimer) redirect("/login");

  const businessIds = partTimer.memberships.map((m) => m.businessId);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [unreadCount, openShiftsCount] = await Promise.all([
    prisma.activity.count({ where: { recipientId: session.user.id, read: false } }),
    prisma.shift.count({
      where: {
        businessId: { in: businessIds },
        status: "open",
        archived: false,
        shiftDate: { gte: today },
        NOT: [
          { assignments: { some: { partTimerId: partTimer.id, status: { not: "cancelled" } } } },
          { interests: { some: { partTimerId: partTimer.id, status: { in: ["pending", "confirmed"] } } } },
        ],
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-sun-page">
      <nav aria-label="Main navigation" className="bg-sun-page">
        <div className="w-[80vw] mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/home" className="font-medium text-sun-ink hover:text-sun-body" style={{ fontSize: 17 }}>
              MyCrew <span className="text-sun-accent">☀</span>
            </Link>
            <PartTimerNavLinks unreadCount={unreadCount} openShiftsCount={openShiftsCount} />
          </div>
          <div className="flex items-center gap-4">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="text-xs text-sun-mute hover:text-sun-ink">
                Sign out
              </button>
            </form>
            <Link href="/home" title={partTimer.name} aria-label={partTimer.name}>
              <NavAvatar
                name={partTimer.name}
                emoji={partTimer.avatarEmoji}
                color={partTimer.avatarColor}
                id={partTimer.id}
              />
            </Link>
          </div>
        </div>
      </nav>
      <main id="main-content" className="px-6 py-6 w-[80vw] mx-auto">{children}</main>
    </div>
  );
}

function NavAvatar({ name, emoji, color, id }: { name: string; emoji: string | null; color: string | null; id: string }) {
  const PASTEL = ["#DBEAFE", "#E9D5FF", "#FDE68A", "#FCE7F3", "#D1FAE5"];
  const bg = color ?? PASTEL[id.charCodeAt(0) % PASTEL.length];
  const initial = name[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
      style={{ background: bg }}
      title={name}
    >
      {emoji ?? initial}
    </div>
  );
}
