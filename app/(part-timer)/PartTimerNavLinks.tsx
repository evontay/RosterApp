"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function PartTimerNavLinks({
  unreadCount,
  openShiftsCount,
}: {
  unreadCount: number;
  openShiftsCount: number;
}) {
  const pathname = usePathname();

  function active(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function pill(href: string) {
    return active(href)
      ? "text-xs font-medium bg-sun-accent-soft text-sun-accent-text px-3 py-1 rounded-full"
      : "text-xs text-sun-mute hover:text-sun-ink";
  }

  const openShiftsActive = active("/open-shifts");

  return (
    <div className="flex items-center gap-5">
      <Link
        href="/open-shifts"
        className={`${pill("/open-shifts")} inline-flex items-center gap-1.5`}
      >
        Open Shifts
        {openShiftsCount > 0 && !openShiftsActive && (
          <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 bg-sun-accent-soft text-sun-accent-text text-[10px] font-bold rounded-full leading-none">
            {openShiftsCount > 99 ? "99+" : openShiftsCount}
          </span>
        )}
      </Link>

      <Link href="/my-shifts" className={pill("/my-shifts")}>My Shifts</Link>

      <Link
        href="/activity"
        className={`${pill("/activity")} inline-flex items-center gap-1.5`}
      >
        Activity
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 bg-alert text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      <Link href="/my-settings" className={pill("/my-settings")}>Settings</Link>
    </div>
  );
}
