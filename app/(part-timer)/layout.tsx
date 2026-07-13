import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PartTimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "part_timer") redirect("/dashboard");

  const [unreadCount, partTimer] = await Promise.all([
    prisma.activity.count({ where: { recipientId: session.user.id, read: false } }),
    prisma.partTimer.findFirst({
      where: { userId: session.user.id },
      select: { id: true, name: true, avatarEmoji: true, avatarColor: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-sun-page">
      <nav className="bg-sun-card border-b border-sun-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/home" className="font-bold text-sun-ink hover:text-sun-body">
            MyCrew <span className="text-sun-accent">☀</span>
          </Link>
          <Link href="/open-shifts" className="text-sm text-sun-mute hover:text-sun-ink">
            Open Shifts
          </Link>
          <Link href="/my-shifts" className="text-sm text-sun-mute hover:text-sun-ink">
            My Shifts
          </Link>
          <Link href="/activity" className="relative text-sm text-sun-mute hover:text-sun-ink">
            Activity
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 bg-alert text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/my-settings" className="text-sm text-sun-mute hover:text-sun-ink">
            Settings
          </Link>
        </div>
        <div className="flex items-center gap-4">
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
          {partTimer && (
            <Link href="/home">
              <NavAvatar
                name={partTimer.name}
                emoji={partTimer.avatarEmoji}
                color={partTimer.avatarColor}
                id={partTimer.id}
              />
            </Link>
          )}
        </div>
      </nav>
      <main className="p-6 max-w-xl mx-auto">{children}</main>
    </div>
  );
}

function NavAvatar({ name, emoji, color, id }: { name: string; emoji: string | null; color: string | null; id: string }) {
  const PASTEL = ["#DBEAFE", "#E9D5FF", "#FDE68A", "#FCE7F3", "#D1FAE5"];
  const bg = color ?? PASTEL[id.charCodeAt(0) % PASTEL.length];
  const initial = name[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="w-8 h-8 rounded-full border border-sun-border flex items-center justify-center text-sm shrink-0"
      style={{ background: bg }}
      title={name}
    >
      {emoji ?? initial}
    </div>
  );
}
