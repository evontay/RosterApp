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

interface Props {
  open: boolean;
  onClose: () => void;
  shift: {
    id: string;
    title: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
    roles: { skillId: string; count: number; payType: string; payRate: number }[];
  };
  skills: Skill[];
}

export function EditShiftForm({ open, onClose, shift, skills }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: shift.title,
    shiftDate: new Date(shift.shiftDate).toISOString().split("T")[0],
    startTime: shift.startTime,
    endTime: shift.endTime,
  });
  const [roles, setRoles] = useState<RoleRow[]>(
    shift.roles.map((r) => ({
      skillId: r.skillId,
      count: r.count,
      payType: r.payType,
      payRate: r.payRate.toString(),
    }))
  );
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

    try {
      const res = await fetch(`/api/shifts/${shift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, roles }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Something went wrong");
      } else {
        onClose();
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-sun-card rounded-[16px] w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="font-semibold text-sun-ink text-lg">Edit shift</h2>
          <div>
            <label className="block text-xs font-medium text-sun-body mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setField("title", e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-sun-body mb-1">Date</label>
            <input type="date" value={form.shiftDate} onChange={(e) => setField("shiftDate", e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-sun-body mb-1">Start time</label>
              <input type="time" value={form.startTime} onChange={(e) => setField("startTime", e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-sun-body mb-1">End time</label>
              <input type="time" value={form.endTime} onChange={(e) => setField("endTime", e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-sun-body mb-1">Roles & pay</label>
            <RolesEditor
              skills={currentSkills}
              roles={roles}
              onChange={(r, s) => { setRoles(r); setCurrentSkills(s); }}
            />
          </div>
          {error && <p className="text-status-open-text text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-sun-border text-sun-body py-2 rounded-full text-sm">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-sun-accent text-white py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
