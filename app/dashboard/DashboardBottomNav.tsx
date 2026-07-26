"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BottomNavTab } from "@/components/BottomNavTab";
import { HomeIcon, UsersIcon, CalendarIcon, BellIcon, DotsIcon } from "@/components/icons/NavIcons";

export function DashboardBottomNav({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  function active(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const settingsActive = pathname.startsWith("/dashboard/settings");
  const iconClass = "w-5 h-5";

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-30 flex md:hidden bg-sun-card border-t border-sun-border pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <BottomNavTab href="/dashboard" label="Home" icon={<HomeIcon className={iconClass} />} active={active("/dashboard")} />
      <BottomNavTab href="/dashboard/roster" label="Roster" icon={<UsersIcon className={iconClass} />} active={active("/dashboard/roster")} />
      <BottomNavTab href="/dashboard/shifts" label="Shifts" icon={<CalendarIcon className={iconClass} />} active={active("/dashboard/shifts")} />
      <BottomNavTab
        href="/dashboard/activity"
        label="Activity"
        icon={<BellIcon className={iconClass} />}
        active={active("/dashboard/activity")}
        badge={unreadCount}
      />

      <div className="relative flex-1">
        <BottomNavTab
          label="More"
          icon={<DotsIcon className={iconClass} />}
          active={settingsActive}
          expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        />

        {moreOpen && (
          <>
            {/* Interim tap-menu — replace with the bottom-sheet primitive when
                swap component 3 (overlay -> sheet) is built. */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-30 bg-transparent"
            />
            <div className="absolute bottom-full right-2 mb-2 z-40 bg-sun-card border border-sun-border rounded-[16px] shadow-lg py-1 w-44">
              <Link
                href="/dashboard/settings/profile"
                onClick={() => setMoreOpen(false)}
                className="block px-4 py-2.5 text-sm text-sun-body hover:bg-sun-inset"
              >
                My profile
              </Link>
              <Link
                href="/dashboard/settings/roles"
                onClick={() => setMoreOpen(false)}
                className="block px-4 py-2.5 text-sm text-sun-body hover:bg-sun-inset"
              >
                Role types
              </Link>
              <Link
                href="/dashboard/settings/performance-tags"
                onClick={() => setMoreOpen(false)}
                className="block px-4 py-2.5 text-sm text-sun-body hover:bg-sun-inset"
              >
                Performance tags
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
