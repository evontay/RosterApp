"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RoleOption {
  label: string;
  payType: string;
  payRate: number;
}

export function HoursForm({
  assignmentId,
  roles,
  currentHours,
}: {
  assignmentId: string;
  roles: RoleOption[];
  currentHours: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(currentHours?.toString() ?? "");
  const [selectedRole, setSelectedRole] = useState(0);
  const [loading, setLoading] = useState(false);

  const role = roles[selectedRole] ?? roles[0];

  async function handleSave() {
    setLoading(true);
    await fetch("/api/shifts/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        hours: parseFloat(hours),
        payType: role.payType,
        payRate: role.payRate,
      }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-blue-600 hover:underline">
        {currentHours != null ? "Edit hours" : "Log hours"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {roles.length > 1 && (
        <select value={selectedRole} onChange={(e) => setSelectedRole(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-xs">
          {roles.map((r, i) => (
            <option key={i} value={i}>{r.label} ({r.payType === "hourly" ? `$${r.payRate}/hr` : `$${r.payRate} flat`})</option>
          ))}
        </select>
      )}
      {role.payType === "hourly" && (
        <input type="number" min="0" step="0.5" value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs w-20"
          placeholder="hrs" />
      )}
      <button onClick={handleSave} disabled={loading || (role.payType === "hourly" && !hours)}
        className="text-xs bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50">
        {loading ? "..." : "Save"}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-400">✕</button>
    </div>
  );
}
