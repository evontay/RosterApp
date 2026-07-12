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
  comment: string | null;
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
  const [comment, setComment] = useState(existing?.comment ?? "");
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
      body: JSON.stringify({ shiftId, partTimerId, attendance, qualityFlag, tagIds: selectedTagIds, comment }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs border border-sun-accent text-sun-accent-link px-3 py-1 rounded-full hover:bg-sun-accent-soft">
        {existing ? "Edit record" : "Add record"}
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-sun-card border border-sun-border rounded-[12px] space-y-3 w-full">
      {/* Attendance */}
      <div>
        <p className="text-xs font-medium text-sun-mute mb-1.5">Attendance</p>
        <div className="flex gap-1">
          {ATTENDANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAttendance(opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                attendance === opt.value
                  ? opt.value === "attended"
                    ? "bg-status-confirmed-dot text-white border-status-confirmed-dot"
                    : opt.value === "late"
                    ? "bg-sun-accent text-white border-sun-accent"
                    : "bg-status-open-dot text-white border-status-open-dot"
                  : "bg-sun-card text-sun-mute border-sun-border hover:border-sun-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <p className="text-xs font-medium text-sun-mute mb-1.5">Quality <span className="font-normal text-sun-faint">(optional)</span></p>
        <div className="flex gap-1">
          {(["good", "issues"] as const).map((flag) => (
            <button
              key={flag}
              type="button"
              onClick={() => setQualityFlag((prev) => (prev === flag ? null : flag))}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                qualityFlag === flag
                  ? flag === "good"
                    ? "bg-status-logged-dot text-white border-status-logged-dot"
                    : "bg-sun-accent text-white border-sun-accent"
                  : "bg-sun-card text-sun-mute border-sun-border hover:border-sun-accent"
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
          <p className="text-xs font-medium text-sun-mute mb-1.5">Tags <span className="font-normal text-sun-faint">(optional)</span></p>
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-sun-ink text-white border-sun-ink"
                    : "bg-sun-card text-sun-mute border-sun-border hover:border-sun-accent"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      <div>
        <p className="text-xs font-medium text-sun-mute mb-1.5">Notes <span className="font-normal text-sun-faint">(optional)</span></p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Private notes about this shift…"
          rows={2}
          className="w-full border border-sun-border rounded-[10px] px-2.5 py-1.5 text-xs text-sun-ink placeholder-sun-mute focus:outline-none focus:border-sun-accent bg-sun-inset resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-sun-accent text-white px-3 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-sun-mute hover:text-sun-body">
          Cancel
        </button>
      </div>
    </div>
  );
}
