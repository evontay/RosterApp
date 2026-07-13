"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HoursForm({
  assignmentId,
  payType,
  payRate,
  currentHours,
  defaultHours,
}: {
  assignmentId: string;
  payType: string;
  payRate: number;
  currentHours: number | null;
  defaultHours?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(currentHours?.toString() ?? defaultHours?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch("/api/shifts/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, hours: parseFloat(hours), payType, payRate }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  // Flat session: no hours needed — just a confirm button
  if (payType === "flat_session") {
    if (currentHours != null) return null;
    return (
      <button
        onClick={handleSave}
        disabled={loading}
        className="text-xs border border-sun-accent text-sun-accent-link px-3 py-1 rounded-full hover:bg-sun-accent-soft disabled:opacity-50"
      >
        {loading ? "..." : "Confirm"}
      </button>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs border border-sun-accent text-sun-accent-link px-3 py-1 rounded-full hover:bg-sun-accent-soft">
        {currentHours != null ? "Edit hours" : "Log hours"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        step="0.5"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        className="border border-sun-border rounded-full px-2 py-1 text-xs w-20 focus:outline-none focus:border-sun-accent"
        placeholder="hrs"
        aria-label="Hours worked"
      />
      <button
        onClick={handleSave}
        disabled={loading || !hours}
        className="text-xs bg-sun-accent text-sun-ink px-2 py-1 rounded-full hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "..." : "Save"}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-sun-mute" aria-label="Cancel">✕</button>
    </div>
  );
}
