"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ShiftStatus = "draft" | "open" | "filled" | "completed" | "cancelled";

const TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  draft:     ["open", "cancelled"],
  open:      ["filled", "cancelled"],
  filled:    ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const STATUS_STYLES: Record<ShiftStatus, string> = {
  draft:     "bg-sun-inset text-sun-mute",
  open:      "bg-status-open-bg text-status-open-text",
  filled:    "bg-status-confirmed-bg text-status-confirmed-text",
  completed: "bg-status-logged-bg text-status-logged-text",
  cancelled: "bg-sun-inset text-sun-mute",
};

const STATUS_LABELS: Record<ShiftStatus, string> = {
  draft:     "Draft",
  open:      "Open",
  filled:    "Confirmed",
  completed: "Logged",
  cancelled: "Cancelled",
};

const ACTION_LABELS: Partial<Record<ShiftStatus, string>> = {
  open:      "Mark open",
  filled:    "Mark confirmed",
  completed: "Mark logged",
  cancelled: "Cancel shift",
};

const ACTION_STYLES: Partial<Record<ShiftStatus, string>> = {
  open:      "border-sun-border text-sun-mute hover:border-sun-accent hover:text-sun-accent-link",
  filled:    "border-sun-border text-sun-mute hover:border-sun-accent hover:text-sun-accent-link",
  completed: "border-sun-border text-sun-mute hover:border-sun-accent hover:text-sun-accent-link",
  cancelled: "border-sun-border text-sun-mute hover:bg-sun-inset",
};

export function ShiftStatusControl({
  shiftId,
  currentStatus,
}: {
  shiftId: string;
  currentStatus: ShiftStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<ShiftStatus | null>(null);

  const next = TRANSITIONS[currentStatus];

  async function handleTransition(toStatus: ShiftStatus) {
    setLoading(toStatus);
    await fetch("/api/shifts/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, status: toStatus }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[currentStatus]}`}>
        {STATUS_LABELS[currentStatus]}
      </span>
      {next.map((toStatus) => (
        <button
          key={toStatus}
          onClick={() => handleTransition(toStatus)}
          disabled={loading !== null}
          className={`px-3 py-1 rounded-full border text-xs font-medium disabled:opacity-50 transition-colors ${ACTION_STYLES[toStatus]}`}
        >
          {loading === toStatus ? "..." : ACTION_LABELS[toStatus]}
        </button>
      ))}
    </div>
  );
}
