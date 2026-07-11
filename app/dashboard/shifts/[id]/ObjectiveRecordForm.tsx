"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Attendance = "attended" | "late" | "no_show";
type QualityFlag = "good" | "issues" | null;

interface Tag { id: string; label: string }

interface ExistingRecord {
  attendance: Attendance;
  qualityFlag: QualityFlag;
  tagIds: string[];
}

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: "attended", label: "Attended" },
  { value: "late", label: "Late" },
  { value: "no_show", label: "No-show" },
];

export function ObjectiveRecordForm({
  shiftId,
  partTimerId,
  availableTags,
  existing,
}: {
  shiftId: string;
  partTimerId: string;
  availableTags: Tag[];
  existing: ExistingRecord | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [attendance, setAttendance] = useState<Attendance>(existing?.attendance ?? "attended");
  const [qualityFlag, setQualityFlag] = useState<QualityFlag>(existing?.qualityFlag ?? null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(existing?.tagIds ?? []);
  const [saving, setSaving] = useState(false);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/performance/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, partTimerId, attendance, qualityFlag, tagIds: selectedTagIds }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:underline"
      >
        {existing ? "Edit record" : "Add record"}
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-3 w-full">
      {/* Attendance */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">Attendance</p>
        <div className="flex gap-1">
          {ATTENDANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAttendance(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                attendance === opt.value
                  ? opt.value === "attended"
                    ? "bg-green-600 text-white border-green-600"
                    : opt.value === "late"
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : "bg-red-500 text-white border-red-500"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">Quality <span className="font-normal text-gray-400">(optional)</span></p>
        <div className="flex gap-1">
          {(["good", "issues"] as const).map((flag) => (
            <button
              key={flag}
              type="button"
              onClick={() => setQualityFlag((prev) => (prev === flag ? null : flag))}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                qualityFlag === flag
                  ? flag === "good"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {flag === "good" ? "Good" : "Issues"}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Tags <span className="font-normal text-gray-400">(optional)</span></p>
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-gray-700 text-white border-gray-700"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}
