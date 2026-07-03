"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  label: string;
}

export function SkillEditor({
  partTimerId,
  allSkills,
  currentSkillIds,
}: {
  partTimerId: string;
  allSkills: Skill[];
  currentSkillIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(currentSkillIds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(skillId: string) {
    setSelected((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/roster/${partTimerId}/skills`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillIds: selected }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const dirty = JSON.stringify([...selected].sort()) !== JSON.stringify([...currentSkillIds].sort());

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {allSkills.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              selected.includes(s.id)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      )}
    </div>
  );
}
