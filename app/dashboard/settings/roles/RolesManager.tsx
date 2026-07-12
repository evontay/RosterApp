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
  archived: boolean;
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
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);

  function startEdit(skill: SkillRow) {
    setEditingId(skill.id);
    setEditLabel(skill.label);
    setEditPayType(skill.defaultPayType ?? "hourly");
    setEditPayRate(skill.defaultPayRate?.toString() ?? "");
    setEditError("");
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

  async function handleArchive(id: string, archived: boolean) {
    setArchivingId(id);
    await fetch(`/api/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    setSkills((prev) => prev.map((s) => s.id === id ? { ...s, archived } : s));
    setArchivingId(null);
    router.refresh();
  }

  const active = skills.filter((s) => !s.archived);
  const archived = skills.filter((s) => s.archived);

  function renderRow(skill: SkillRow) {
    const isEditing = editingId === skill.id;

    return (
      <div key={skill.id} className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sun-ink text-sm">{skill.label}</p>
            <p className="text-xs text-sun-mute mt-0.5">
              {skill.defaultPayType
                ? `Default: ${skill.defaultPayType === "hourly" ? `$${skill.defaultPayRate ?? "–"}/hr` : `$${skill.defaultPayRate ?? "–"} flat`}`
                : "No default pay set"}
              {" · "}
              {[
                skill.shiftCount > 0 && `${skill.shiftCount} shift${skill.shiftCount !== 1 ? "s" : ""}`,
                skill.partTimerCount > 0 && `${skill.partTimerCount} employee${skill.partTimerCount !== 1 ? "s" : ""}`,
              ].filter(Boolean).join(" · ") || "Not in use"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!skill.archived && (
              <button
                onClick={() => isEditing ? setEditingId(null) : startEdit(skill)}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${isEditing ? "border-sun-accent text-sun-accent-link bg-sun-accent-soft" : "border-sun-border text-sun-mute hover:border-sun-accent hover:text-sun-accent-link"}`}
              >
                Edit
              </button>
            )}
            <button
              onClick={() => handleArchive(skill.id, !skill.archived)}
              disabled={archivingId === skill.id}
              className="text-xs px-2.5 py-1.5 rounded-full border border-sun-border text-sun-mute hover:border-sun-accent hover:text-sun-body disabled:opacity-50"
            >
              {archivingId === skill.id ? "..." : skill.archived ? "Unarchive" : "Archive"}
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setEditingId(null); }}
                className="flex-1 border border-sun-accent rounded-[10px] px-3 py-1.5 text-sm focus:outline-none focus:border-sun-accent"
                placeholder="Role name"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={editPayType}
                onChange={(e) => setEditPayType(e.target.value)}
                className="border border-sun-border rounded-[10px] px-2 py-1.5 text-sm focus:outline-none focus:border-sun-accent"
              >
                <option value="hourly">Hourly</option>
                <option value="flat_session">Flat</option>
              </select>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sun-mute text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPayRate}
                  onChange={(e) => setEditPayRate(e.target.value)}
                  placeholder="default rate"
                  className="border border-sun-border rounded-[10px] pl-5 pr-2 py-1.5 text-sm w-32 focus:outline-none focus:border-sun-accent"
                />
              </div>
              <button
                onClick={() => handleSaveEdit(skill.id)}
                disabled={editSaving || !editLabel.trim()}
                className="text-sm bg-sun-accent text-white px-3 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50"
              >
                {editSaving ? "..." : "Save"}
              </button>
              <button onClick={() => setEditingId(null)} className="text-sm text-sun-mute hover:text-sun-body">
                Cancel
              </button>
            </div>
          </div>
        )}
        {editError && editingId === skill.id && (
          <p className="text-status-open-text text-xs mt-1">{editError}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-sun-card rounded-[16px] border border-sun-border divide-y divide-sun-border">
        {active.length === 0 && (
          <p className="px-5 py-8 text-sm text-sun-mute text-center">🌱 No role types yet.</p>
        )}
        {active.map(renderRow)}
      </div>

      {archived.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setArchivedOpen((v) => !v)}
            className="flex items-center gap-2 text-sm text-sun-mute hover:text-sun-body mb-3"
          >
            <span className={`transition-transform inline-block ${archivedOpen ? "rotate-90" : ""}`}>▶</span>
            Archived role types ({archived.length})
          </button>

          {archivedOpen && (
            <div className="bg-sun-card rounded-[16px] border border-sun-border divide-y divide-sun-border opacity-60">
              {archived.map(renderRow)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
