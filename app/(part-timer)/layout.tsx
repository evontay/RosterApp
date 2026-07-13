import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PartTimerNavLinks } from "./PartTimerNavLinks";
import { Avatar } from "@/components/Avatar";

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
    <div className="site-shell">
      <nav aria-label="Main navigation" className="site-nav">
        <div className="site-nav-inner">
          <div className="site-nav-left">
            <Link href="/home" className="font-medium text-sun-ink hover:text-sun-body" style={{ fontSize: 17 }}>
              MyCrew <span className="text-sun-accent">☀</span>
            </Link>
            <PartTimerNavLinks unreadCount={unreadCount} openShiftsCount={openShiftsCount} />
          </div>
          <div className="site-nav-right">
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
              <Avatar
                name={partTimer.name}
                avatarEmoji={partTimer.avatarEmoji}
                avatarColor={partTimer.avatarColor}
                id={partTimer.id}
                size="xs"
              />
            </Link>
          </div>
        </div>
      </nav>
      <main id="main-content" className="site-main">{children}</main>
    </div>
  );
}

