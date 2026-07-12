"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ArchiveRestoreButton } from "./RemoveButton";

interface ArchivedMember {
  id: string;
  partTimerId: string;
  partTimer: {
    id: string;
    name: string;
    email: string;
    avatarEmoji: string | null;
    avatarColor: string | null;
  };
}

export function ArchivedRosterSection({ members }: { members: ArchivedMember[] }) {
  const [open, setOpen] = useState(false);

  if (members.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-sun-mute hover:text-sun-body flex items-center gap-1"
      >
        <span>{open ? "▼" : "▶"}</span>
        <span>Archived employees ({members.length})</span>
      </button>

      {open && (
        <div className="mt-2 bg-sun-card rounded-[16px] border border-sun-border overflow-hidden opacity-60">
          <table className="w-full text-sm">
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-sun-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={m.partTimer.name}
                        avatarEmoji={m.partTimer.avatarEmoji}
                        avatarColor={m.partTimer.avatarColor}
                        id={m.partTimer.id}
                        size="sm"
                      />
                      <div>
                        <Link
                          href={`/dashboard/roster/${m.partTimer.id}`}
                          className="font-medium text-sun-ink hover:text-sun-accent-link"
                        >
                          {m.partTimer.name}
                        </Link>
                        <p className="text-xs text-sun-mute">{m.partTimer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ArchiveRestoreButton membershipId={m.id} archived={true} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
