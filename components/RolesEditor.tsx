"use client";

import { useState } from "react";

interface Skill {
  id: string;
  label: string;
  defaultPayType?: string | null;
  defaultPayRate?: number | null;
}

export interface RoleRow {
  skillId: string;
  count: number;
  payType: string;
  payRate: string;
}

export function RolesEditor({
  skills: initialSkills,
  roles,
  onChange,
}: {
  skills: Skill[];
  roles: RoleRow[];
  onChange: (roles: RoleRow[], skills: Skill[]) => void;
}) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  function pushUpdate(newRoles: RoleRow[], newSkills: Skill[]) {
    setSkills(newSkills);
    onChange(newRoles, newSkills);
  }

  function updateRole(i: number, field: keyof RoleRow, value: string | number) {
    const updated = roles.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    // If skill changed, pre-fill pay defaults from new skill
    if (field === "skillId") {
      const skill = skills.find((s) => s.id === value);
      updated[i] = {
        ...updated[i],
        payType: skill?.defaultPayType ?? "hourly",
        payRate: skill?.defaultPayRate?.toString() ?? "",
      };
    }
    pushUpdate(updated, skills);
  }

  function removeRole(i: number) {
    pushUpdate(roles.filter((_, idx) => idx !== i), skills);
  }

  function addRole() {
    const used = new Set(roles.map((r) => r.skillId));
    const next = skills.find((s) => !used.has(s.id));
    if (next) {
      pushUpdate([...roles, {
        skillId: next.id,
        count: 1,
        payType: next.defaultPayType ?? "hourly",
        payRate: next.defaultPayRate?.toString() ?? "",
      }], skills);
    }
  }

  async function handleCreateSkill() {
    if (!newLabel.trim()) return;
    setCreating(true);
    setCreateError("");

    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    const data = await res.json();

    if (!res.ok) { setCreateError(data.error ?? "Could not create role"); setCreating(false); return; }

    const newSkill: Skill = { id: data.id, label: data.label, defaultPayType: null, defaultPayRate: null };
    const updatedSkills = [...skills, newSkill];
    setNewLabel("");
    setAddingNew(false);
    setCreating(false);
    pushUpdate([...roles, { skillId: newSkill.id, count: 1, payType: "hourly", payRate: "" }], updatedSkills);
  }

  return (
    <div className="space-y-2">
      {roles.map((role, i) => (
        <div key={i} className="grid grid-cols-[1fr_40px_100px_100px_auto] gap-2 items-center">
          {/* Skill */}
          <select value={role.skillId} onChange={(e) => updateRole(i, "skillId", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm">
            {skills.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          {/* Count */}
          <input type="number" min="1" max="99" value={role.count}
            onChange={(e) => updateRole(i, "count", parseInt(e.target.value) || 1)}
            className="border border-gray-300 rounded px-2 py-2 text-sm text-center w-full" />

          {/* Pay type */}
          <select value={role.payType} onChange={(e) => updateRole(i, "payType", e.target.value)}
            className="border border-gray-300 rounded px-2 py-2 text-sm">
            <option value="hourly">Hourly</option>
            <option value="flat_session">Flat</option>
          </select>

          {/* Pay rate */}
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input type="number" min="0" step="0.01" value={role.payRate}
              onChange={(e) => updateRole(i, "payRate", e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded pl-5 pr-2 py-2 text-sm" />
          </div>

          {/* Remove row */}
          {roles.length > 1
            ? <button type="button" onClick={() => removeRole(i)}
                className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
            : <div />
          }
        </div>
      ))}

      {/* Column labels */}
      <div className="grid grid-cols-[1fr_40px_100px_100px_auto] gap-2 px-0.5">
        <span className="text-[10px] text-gray-400">Role</span>
        <span className="text-[10px] text-gray-400 text-center">#</span>
        <span className="text-[10px] text-gray-400">Pay type</span>
        <span className="text-[10px] text-gray-400">Rate</span>
        <span />
      </div>

      <div className="flex items-center gap-3 pt-1">
        {roles.length < skills.length && !addingNew && (
          <button type="button" onClick={addRole}
            className="text-sm text-blue-600 hover:underline">+ Add role</button>
        )}
        {!addingNew && (
          <button type="button" onClick={() => setAddingNew(true)}
            className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
            + New custom role
          </button>
        )}
      </div>

      {addingNew && (
        <div className="flex items-center gap-2">
          <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateSkill(); } }}
            placeholder="e.g. Photographer"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" autoFocus />
          <button type="button" onClick={handleCreateSkill}
            disabled={creating || !newLabel.trim()}
            className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 disabled:opacity-50">
            {creating ? "..." : "Create"}
          </button>
          <button type="button" onClick={() => { setAddingNew(false); setNewLabel(""); setCreateError(""); }}
            className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}
      {createError && <p className="text-red-500 text-xs">{createError}</p>}
    </div>
  );
}
