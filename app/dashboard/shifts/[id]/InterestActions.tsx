"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  interestId: string;
  preferredRoleId: string | null;
  roleOptions: { id: string; label: string }[];
}

export function InterestActions({ interestId, preferredRoleId, roleOptions }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(preferredRoleId ?? roleOptions[0]?.id ?? "");

  async function handle(action: "confirm" | "reject") {
    setLoading(action);
    await fetch(`/api/shifts/interest/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interestId, shiftRoleId: selectedRoleId || undefined }),
    });
    setLoading(null);
    router.refresh();
  }

  if (roleOptions.length === 0) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-sun-mute">No slots available</span>
        <button
          onClick={() => handle("reject")}
          disabled={loading !== null}
          className="text-xs px-3 py-1 border border-gray-200 text-sun-mute rounded-full hover:bg-sun-inset disabled:opacity-50"
        >
          {loading === "reject" ? "..." : "Reject"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Role selector — only shown when no preferred role or multiple options */}
      {(!preferredRoleId || roleOptions.length > 1) && (
        <select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          className="text-xs border border-sun-border rounded-full px-2 py-1 text-sun-body"
        >
          {roleOptions.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      )}
      <button
        onClick={() => handle("confirm")}
        disabled={loading !== null || !selectedRoleId}
        className="text-xs px-3 py-1 bg-[#059669] text-white rounded-full hover:opacity-90 disabled:opacity-50"
      >
        {loading === "confirm" ? "..." : "Confirm"}
      </button>
      <button
        onClick={() => handle("reject")}
        disabled={loading !== null}
        className="text-xs px-3 py-1 border border-gray-200 text-sun-mute rounded-full hover:bg-sun-inset disabled:opacity-50"
      >
        {loading === "reject" ? "..." : "Reject"}
      </button>
    </div>
  );
}
