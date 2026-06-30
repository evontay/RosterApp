"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  partTimerId: string;
  partTimer: { name: string };
}

export function AssignForm({ shiftId, members }: { shiftId: string; members: Member[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [partTimerId, setPartTimerId] = useState(members[0]?.partTimerId ?? "");
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    setLoading(true);
    await fetch("/api/shifts/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, partTimerId }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
      >
        + Assign
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={partTimerId}
        onChange={(e) => setPartTimerId(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
      >
        {members.map((m) => (
          <option key={m.partTimerId} value={m.partTimerId}>
            {m.partTimer.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading}
        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "..." : "Confirm"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        Cancel
      </button>
    </div>
  );
}
