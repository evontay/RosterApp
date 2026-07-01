"use client";

import { useState } from "react";

interface Skill { id: string; label: string }
interface RoleRow { skillId: string; count: number }

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
    pushUpdate(roles.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)), skills);
  }

  function removeRole(i: number) {
    pushUpdate(roles.filter((_, idx) => idx !== i), skills);
  }

  function addRole() {
    const used = new Set(roles.map((r) => r.skillId));
    const next = skills.find((s) => !used.has(s.id));
    if (next) pushUpdate([...roles, { skillId: next.id, count: 1 }], skills);
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

    const newSkill: Skill = { id: data.id, label: data.label };
    const updatedSkills = [...skills, newSkill];
    setNewLabel("");
    setAddingNew(false);
    setCreating(false);
    pushUpdate([...roles, { skillId: newSkill.id, count: 1 }], updatedSkills);
  }

  return (
    <div>
      <div className="space-y-2">
        {roles.map((role, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={role.skillId}
              onChange={(e) => updateRole(i, "skillId", e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {skills.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <span className="text-sm text-gray-400">×</span>
            <input
              type="number" min="1" max="99" value={role.count}
              onChange={(e) => updateRole(i, "count", parseInt(e.target.value) || 1)}
              className="w-16 border border-gray-300 rounded px-2 py-2 text-sm text-center"
            />
            {roles.length > 1 && (
              <button type="button" onClick={() => removeRole(i)}
                className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-2">
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
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateSkill(); } }}
            placeholder="e.g. Photographer"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
            autoFocus
          />
          <button type="button" onClick={handleCreateSkill}
            disabled={creating || !newLabel.trim()}
            className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 disabled:opacity-50">
            {creating ? "..." : "Create"}
          </button>
          <button type="button" onClick={() => { setAddingNew(false); setNewLabel(""); setCreateError(""); }}
            className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
          {createError && <p className="text-red-500 text-xs mt-1">{createError}</p>}
        </div>
      )}
    </div>
  );
}
