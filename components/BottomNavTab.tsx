import Link from "next/link";
import type { ReactNode } from "react";

type BottomNavTabProps = {
  href?: string;
  onClick?: () => void;
  /** Only meaningful for the button variant — whether the popover it controls is open. */
  expanded?: boolean;
  label: string;
  icon: ReactNode;
  active: boolean;
  badge?: number;
};

export function BottomNavTab({ href, onClick, expanded, label, icon, active, badge }: BottomNavTabProps) {
  // w-full matters for the <button> variant: unlike <a>, form controls don't
  // stretch to fill a block-level flex parent on their own (they shrink-wrap
  // to content), which left the "More" tab pinned to the left of its slot.
  const className = `flex-1 w-full flex flex-col items-center justify-center gap-0.5 min-h-[48px] ${
    active ? "text-sun-accent-link" : "text-sun-mute"
  }`;

  const content = (
    <>
      <span className="relative inline-flex">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 bg-alert text-white text-[10px] font-bold rounded-full leading-none"
            aria-hidden="true"
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className={`text-[10px] ${active ? "font-medium" : ""}`}>{label}</span>
      {badge !== undefined && badge > 0 && <span className="sr-only">{badge} unread</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-haspopup="menu" aria-expanded={expanded}>
      {content}
    </button>
  );
}
