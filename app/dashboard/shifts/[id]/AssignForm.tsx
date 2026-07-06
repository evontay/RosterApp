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
        className="text-xs text-blue-600 hover:underline"
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
        className="border border-gray-300 rounded px-2 py-1 text-xs"
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
        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "..." : "Confirm"}
      </button>
      <button
        onClick={() => { setOpen(false); setPartTimerId(""); setError(""); }}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
