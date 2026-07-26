"use client";

import { usePathname } from "next/navigation";
import { BottomNavTab } from "@/components/BottomNavTab";
import { HomeIcon, BriefcaseIcon, ListIcon, BellIcon, UserIcon } from "@/components/icons/NavIcons";

export function PartTimerBottomNav({
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

  const iconClass = "w-5 h-5";

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-30 flex md:hidden bg-sun-card border-t border-sun-border pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <BottomNavTab href="/home" label="Home" icon={<HomeIcon className={iconClass} />} active={active("/home")} />
      <BottomNavTab
        href="/open-shifts"
        label="Open shifts"
        icon={<BriefcaseIcon className={iconClass} />}
        active={active("/open-shifts")}
        badge={openShiftsCount}
      />
      <BottomNavTab href="/my-shifts" label="My shifts" icon={<ListIcon className={iconClass} />} active={active("/my-shifts")} />
      <BottomNavTab
        href="/activity"
        label="Activity"
        icon={<BellIcon className={iconClass} />}
        active={active("/activity")}
        badge={unreadCount}
      />
      <BottomNavTab href="/my-settings" label="Me" icon={<UserIcon className={iconClass} />} active={active("/my-settings")} />
    </nav>
  );
}
