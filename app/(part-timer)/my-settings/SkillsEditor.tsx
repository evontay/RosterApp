"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  label: string;
}

export function SkillsEditor({
  allSkills,
  currentSkillIds,
}: {
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
    await fetch("/api/profile/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillIds: selected }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const dirty =
    JSON.stringify([...selected].sort()) !== JSON.stringify([...currentSkillIds].sort());

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {allSkills.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              selected.includes(s.id)
                ? "bg-sun-accent text-sun-ink border-sun-accent"
                : "bg-sun-card text-sun-mute border-sun-border hover:border-sun-accent hover:text-sun-accent-link"
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
          className="text-xs bg-sun-accent text-sun-ink px-3 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      )}
    </div>
  );
}
