"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = typeof DAYS[number];
type Preference = "morning" | "afternoon" | "flexible";

const OPTIONS: { value: Preference; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "flexible", label: "Flexible" },
];

export function AvailabilityEditor({
  initial,
}: {
  initial: { dayOfWeek: string; preference: string }[];
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Partial<Record<Day, Preference>>>(() => {
    const map: Partial<Record<Day, Preference>> = {};
    for (const a of initial) {
      map[a.dayOfWeek as Day] = a.preference as Preference;
    }
    return map;
  });
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(day: Day, value: Preference) {
    const current = prefs[day];
    const next = current === value ? null : value;

    setSaving(day);
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek: day, preference: next }),
    });

    setPrefs((p) => {
      const updated = { ...p };
      if (next) updated[day] = next;
      else delete updated[day];
      return updated;
    });
    setSaving(null);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const selected = prefs[day];
        const isSaving = saving === day;
        return (
          <div key={day} className="flex items-center gap-3">
            <span className={`w-8 text-xs font-medium shrink-0 ${selected ? "text-gray-800" : "text-gray-400"}`}>
              {day}
            </span>
            <div className="flex gap-1.5">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggle(day, opt.value)}
                  disabled={isSaving}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                    selected === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 pt-1">
        Tap a day to set your preference. Tap again to clear it.
      </p>
    </div>
  );
}
