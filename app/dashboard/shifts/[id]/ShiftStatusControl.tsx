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
  draft:     "bg-gray-100 text-gray-600",
  open:      "bg-blue-100 text-blue-700",
  filled:    "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const ACTION_LABELS: Partial<Record<ShiftStatus, string>> = {
  open:      "Mark open",
  filled:    "Mark filled",
  completed: "Mark completed",
  cancelled: "Cancel shift",
};

const ACTION_STYLES: Partial<Record<ShiftStatus, string>> = {
  open:      "border-blue-300 text-blue-700 hover:bg-blue-50",
  filled:    "border-purple-300 text-purple-700 hover:bg-purple-50",
  completed: "border-green-300 text-green-700 hover:bg-green-50",
  cancelled: "border-red-200 text-red-500 hover:bg-red-50",
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
      <span className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${STATUS_STYLES[currentStatus]}`}>
        {currentStatus}
      </span>
      {next.map((toStatus) => (
        <button
          key={toStatus}
          onClick={() => handleTransition(toStatus)}
          disabled={loading !== null}
          className={`px-3 py-1 rounded border text-xs font-medium disabled:opacity-50 transition-colors ${ACTION_STYLES[toStatus]}`}
        >
          {loading === toStatus ? "..." : ACTION_LABELS[toStatus]}
        </button>
      ))}
    </div>
  );
}
