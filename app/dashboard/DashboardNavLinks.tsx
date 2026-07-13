"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function DashboardNavLinks({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  function active(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function pill(href: string) {
    return active(href)
      ? "text-xs font-medium bg-sun-accent-soft text-sun-accent-text px-3 py-1 rounded-full"
      : "text-xs text-sun-mute hover:text-sun-ink";
  }

  const settingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <div className="flex items-center gap-5">
      <Link href="/dashboard" className={pill("/dashboard")}>Dashboard</Link>
      <Link href="/dashboard/roster" className={pill("/dashboard/roster")}>Roster</Link>
      <Link href="/dashboard/shifts" className={pill("/dashboard/shifts")}>Shifts</Link>

      <Link
        href="/dashboard/activity"
        className={`${pill("/dashboard/activity")} inline-flex items-center gap-1.5`}
      >
        Activity
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 bg-alert text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      {/* Settings dropdown */}
      <div className="group relative">
        <span className={`cursor-default select-none ${settingsActive ? "text-xs font-medium bg-sun-accent-soft text-sun-accent-text px-3 py-1 rounded-full" : "text-xs text-sun-mute hover:text-sun-ink"}`}>
          Settings ▾
        </span>
        <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-20">
          <div className="bg-sun-card border border-sun-border rounded-[16px] shadow-lg py-1 w-44">
            <Link href="/dashboard/settings/profile" className="block px-4 py-2 text-sm text-sun-body hover:bg-sun-inset">
              My profile
            </Link>
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
  );
}
