"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  label: string;
}

interface RoleRow {
  skillId: string;
  count: number;
}

export function NewShiftForm({
  businessId,
  skills,
  defaultDate,
}: {
  businessId: string;
  skills: Skill[];
  defaultDate?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    shiftDate: defaultDate ?? "",
    startTime: "",
    endTime: "",
    payType: "hourly",
    payRate: "",
  });
  const [roles, setRoles] = useState<RoleRow[]>([{ skillId: skills[0]?.id ?? "", count: 1 }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateRole(index: number, field: keyof RoleRow, value: string | number) {
    setRoles((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRole() {
    const usedIds = new Set(roles.map((r) => r.skillId));
    const next = skills.find((s) => !usedIds.has(s.id));
    if (next) setRoles((prev) => [...prev, { skillId: next.id, count: 1 }]);
  }

  function removeRole(index: number) {
    setRoles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (roles.length === 0) { setError("Add at least one role"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, businessId, roles }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
    } else {
      router.push(`/dashboard/shifts/${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="e.g. Weekend pottery workshop"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={form.shiftDate}
          onChange={(e) => setField("shiftDate", e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setField("startTime", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setField("endTime", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      {/* Roles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles needed</label>
        <div className="space-y-2">
          {roles.map((role, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={role.skillId}
                onChange={(e) => updateRole(i, "skillId", e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              >
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">×</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={role.count}
                  onChange={(e) => updateRole(i, "count", parseInt(e.target.value) || 1)}
                  className="w-16 border border-gray-300 rounded px-2 py-2 text-sm text-center"
                />
              </div>
              {roles.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRole(i)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {roles.length < skills.length && (
          <button
            type="button"
            onClick={addRole}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            + Add another role
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pay type</label>
          <select
            value={form.payType}
            onChange={(e) => setField("payType", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="hourly">Hourly</option>
            <option value="flat_session">Flat session</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.payRate}
            onChange={(e) => setField("payRate", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create shift"}
        </button>
      </div>
    </form>
  );
}
