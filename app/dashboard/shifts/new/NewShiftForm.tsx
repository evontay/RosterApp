"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RolesEditor, RoleRow } from "@/components/RolesEditor";

interface Skill {
  id: string;
  label: string;
  defaultPayType?: string | null;
  defaultPayRate?: number | null;
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
  });
  const [roles, setRoles] = useState<RoleRow[]>([{
    skillId: skills[0]?.id ?? "",
    count: 1,
    payType: skills[0]?.defaultPayType ?? "hourly",
    payRate: skills[0]?.defaultPayRate?.toString() ?? "",
  }]);
  const [currentSkills, setCurrentSkills] = useState<Skill[]>(skills);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (roles.length === 0) { setError("Add at least one role"); return; }
    if (roles.some((r) => !r.payRate)) { setError("Enter a pay rate for each role"); return; }
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles & pay</label>
        <RolesEditor
          skills={currentSkills}
          roles={roles}
          onChange={(r, s) => { setRoles(r); setCurrentSkills(s); }}
        />
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
