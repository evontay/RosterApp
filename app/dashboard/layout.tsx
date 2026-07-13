import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, hashColor } from "@/components/Avatar";
import { DashboardNavLinks } from "./DashboardNavLinks";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "owner") redirect("/my-shifts");

  const [unreadCount, business] = await Promise.all([
    prisma.activity.count({ where: { recipientId: session.user.id, read: false } }),
    prisma.business.findFirst({
      where: { ownerUserId: session.user.id },
      select: { id: true, name: true, ownerName: true, avatarEmoji: true, avatarColor: true },
    }),
  ]);

  return (
    <div className="site-shell">
      <nav aria-label="Dashboard navigation" className="site-nav">
        <div className="site-nav-inner">
          <div className="site-nav-left">
            <Link href="/dashboard" className="font-medium text-sun-ink hover:text-sun-body" style={{ fontSize: 17 }}>
              MyCrew <span className="text-sun-accent">☀</span>
            </Link>
            <DashboardNavLinks unreadCount={unreadCount} />
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
            <Link href="/dashboard/settings/profile" title={business?.ownerName ?? business?.name ?? session.user.email ?? ""}>
              {business ? (
                <Avatar
                  name={business.ownerName ?? business.name}
                  avatarEmoji={business.avatarEmoji}
                  avatarColor={business.avatarColor ?? hashColor(business.id)}
                  id={business.id}
                  size="xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-sun-accent-soft flex items-center justify-center text-xs font-medium text-sun-accent-text shrink-0">
                  {(session.user.email ?? "O")[0].toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </div>
      </nav>
      <main id="main-content" className="site-main">{children}</main>
    </div>
  );
}
