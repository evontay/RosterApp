"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  partTimerId: string;
  partTimer: { name: string };
}

export function AssignForm({
  shiftId,
  shiftRoleId,
  members,
}: {
  shiftId: string;
  shiftRoleId: string;
  members: Member[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [partTimerId, setPartTimerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAssign() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shifts/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId, partTimerId, shiftRoleId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
    } catch {
      setError("Network error");
      setLoading(false);
      return;
    }
    setLoading(false);
    setOpen(false);
    setPartTimerId("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs border border-sun-accent text-sun-accent-link px-3 py-1 rounded-full hover:bg-sun-accent-soft"
      >
        + Fill slot
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <select
        value={partTimerId}
        onChange={(e) => setPartTimerId(e.target.value)}
        className="border border-sun-border rounded-full px-2 py-1 text-xs"
        aria-label="Select employee to assign"
      >
        <option value="">Select employee...</option>
        {members.map((m) => (
          <option key={m.partTimerId} value={m.partTimerId}>
            {m.partTimer.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading || !partTimerId}
        className="text-xs bg-[#059669] text-white px-3 py-1 rounded-full hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "..." : "Confirm"}
      </button>
      <button
        onClick={() => { setOpen(false); setPartTimerId(""); setError(""); }}
        className="text-xs text-sun-mute hover:text-sun-body"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-status-open-text">{error}</span>}
    </div>
  );
}
