import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "owner") redirect("/my-shifts");

  const unreadCount = await prisma.activity.count({
    where: { recipientId: session.user.id, read: false },
  });

  return (
    <div className="min-h-screen bg-sun-page">
      <nav className="bg-sun-card border-b border-sun-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-sun-ink hover:text-sun-body">
            MyCrew <span className="text-sun-accent">☀</span>
          </Link>
          <Link href="/dashboard/roster" className="text-sm text-sun-mute hover:text-sun-ink">
            Roster
          </Link>
          <Link href="/dashboard/shifts" className="text-sm text-sun-mute hover:text-sun-ink">
            Shifts
          </Link>
          <Link href="/dashboard/activity" className="relative text-sm text-sun-mute hover:text-sun-ink">
            Activity
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 bg-alert text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <div className="group relative">
            <span className="text-sm text-sun-mute hover:text-sun-ink cursor-default select-none">
              Settings
            </span>
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-20">
              <div className="bg-sun-card border border-sun-border rounded-[16px] shadow-lg py-1 w-44">
                <Link href="/dashboard/settings/roles" className="block px-4 py-2 text-sm text-sun-body hover:bg-sun-inset">
                  Role types
                </Link>
                <Link href="/dashboard/settings/performance-tags" className="block px-4 py-2 text-sm text-sun-body hover:bg-sun-inset">
                  Performance tags
                </Link>
              </div>
            </div>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="text-sm text-sun-mute hover:text-sun-ink">
            Sign out
          </button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
