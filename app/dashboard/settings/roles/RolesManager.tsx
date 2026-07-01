"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SkillRow {
  id: string;
  label: string;
  defaultPayType: string | null;
  defaultPayRate: number | null;
  shiftCount: number;
  partTimerCount: number;
}

export function RolesManager({ skills: initial }: { skills: SkillRow[] }) {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillRow[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPayType, setEditPayType] = useState<string>("hourly");
  const [editPayRate, setEditPayRate] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  function startEdit(skill: SkillRow) {
    setEditingId(skill.id);
    setEditLabel(skill.label);
    setEditPayType(skill.defaultPayType ?? "hourly");
    setEditPayRate(skill.defaultPayRate?.toString() ?? "");
    setEditError("");
    setDeletingId(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editLabel.trim()) return;
    setEditSaving(true);
    setEditError("");

    const res = await fetch(`/api/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: editLabel.trim(),
        defaultPayType: editPayType || null,
        defaultPayRate: editPayRate ? parseFloat(editPayRate) : null,
      }),
    });
    const data = await res.json();

    if (!res.ok) { setEditError(data.error ?? "Could not save"); setEditSaving(false); return; }

    setSkills((prev) => prev.map((s) => s.id === id ? {
      ...s,
      label: data.label,
      defaultPayType: data.defaultPayType ?? null,
      defaultPayRate: data.defaultPayRate != null ? Number(data.defaultPayRate) : null,
    } : s));
    setEditingId(null);
    setEditSaving(false);
    router.refresh();
  }

  function startDelete(id: string) {
    setDeletingId(id);
    setDeleteError("");
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    setDeleteError("");

    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) { setDeleteError(data.error ?? "Could not delete"); setDeleteLoading(false); return; }

    setSkills((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
    setDeleteLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
      {skills.length === 0 && (
        <p className="px-5 py-8 text-sm text-gray-400 text-center">No role types yet.</p>
      )}
      {skills.map((skill) => {
        const inUse = skill.shiftCount > 0 || skill.partTimerCount > 0;
        const isEditing = editingId === skill.id;
        const isDeleting = deletingId === skill.id;

        return (
          <div key={skill.id} className="px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800 text-sm">{skill.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {skill.defaultPayType
                    ? `Default: ${skill.defaultPayType === "hourly" ? `$${skill.defaultPayRate ?? "–"}/hr` : `$${skill.defaultPayRate ?? "–"} flat`}`
                    : "No default pay set"}
                  {" · "}
                  {[
                    skill.shiftCount > 0 && `${skill.shiftCount} shift${skill.shiftCount !== 1 ? "s" : ""}`,
                    skill.partTimerCount > 0 && `${skill.partTimerCount} part-timer${skill.partTimerCount !== 1 ? "s" : ""}`,
                  ].filter(Boolean).join(" · ") || "Not in use"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => isEditing ? setEditingId(null) : startEdit(skill)}
                  className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${isEditing ? "border-blue-400 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => isDeleting ? setDeletingId(null) : startDelete(skill.id)}
                  disabled={inUse}
                  title={inUse ? "Cannot delete — role is in use" : "Delete role type"}
                  className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                    inUse
                      ? "border-gray-100 text-gray-300 cursor-not-allowed"
                      : isDeleting
                      ? "border-red-400 text-red-600 bg-red-50"
                      : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Inline edit */}
            {isEditing && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 border border-blue-300 rounded px-3 py-1.5 text-sm"
                    placeholder="Role name"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={editPayType}
                    onChange={(e) => setEditPayType(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="flat_session">Flat</option>
                  </select>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editPayRate}
                      onChange={(e) => setEditPayRate(e.target.value)}
                      placeholder="default rate"
                      className="border border-gray-300 rounded pl-5 pr-2 py-1.5 text-sm w-32"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveEdit(skill.id)}
                    disabled={editSaving || !editLabel.trim()}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editSaving ? "..." : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-gray-400 hover:text-gray-600">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {editError && editingId === skill.id && (
              <p className="text-red-500 text-xs mt-1">{editError}</p>
            )}

            {/* Delete confirm */}
            {isDeleting && (
              <div className="mt-3 flex items-center gap-2">
                <p className="text-sm text-gray-600">Delete <strong>{skill.label}</strong>? This cannot be undone.</p>
                <button
                  onClick={() => handleDelete(skill.id)}
                  disabled={deleteLoading}
                  className="text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
                >
                  {deleteLoading ? "..." : "Yes, delete"}
                </button>
                <button onClick={() => setDeletingId(null)} className="text-sm text-gray-400 hover:text-gray-600">
                  Cancel
                </button>
              </div>
            )}
            {deleteError && deletingId === skill.id && (
              <p className="text-red-500 text-xs mt-1">{deleteError}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
