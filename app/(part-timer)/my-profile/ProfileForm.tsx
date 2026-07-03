"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

interface PartTimer {
  id: string;
  name: string;
  phone: string | null;
  availability: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
}

export function ProfileForm({ partTimer }: { partTimer: PartTimer }) {
  const router = useRouter();
  const [name, setName] = useState(partTimer.name);
  const [phone, setPhone] = useState(partTimer.phone ?? "");
  const [availability, setAvailability] = useState(
    partTimer.availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleDay(day: string) {
    if (availability.find((a) => a.dayOfWeek === day)) {
      setAvailability((prev) => prev.filter((a) => a.dayOfWeek !== day));
    } else {
      setAvailability((prev) => [...prev, { dayOfWeek: day, startTime: "09:00", endTime: "17:00" }]);
    }
  }

  function updateAvail(day: string, field: "startTime" | "endTime", value: string) {
    setAvailability((prev) =>
      prev.map((a) => (a.dayOfWeek === day ? { ...a, [field]: value } : a))
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, availability }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Personal info</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Weekly availability</h2>
        <div className="space-y-3">
          {DAYS.map((day) => {
            const avail = availability.find((a) => a.dayOfWeek === day);
            return (
              <div key={day} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-12 text-xs font-medium py-1 rounded border ${
                    avail
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-400 border-gray-200"
                  }`}
                >
                  {day}
                </button>
                {avail && (
                  <>
                    <input
                      type="time"
                      value={avail.startTime}
                      onChange={(e) => updateAvail(day, "startTime", e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={avail.endTime}
                      onChange={(e) => updateAvail(day, "endTime", e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save profile"}
      </button>
    </form>
  );
}
