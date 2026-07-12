"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  shiftId: string;
  currentStatus: string | null;
  currentComment: string | null;
}

export function InterestForm({ shiftId, currentStatus, currentComment }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch("/api/shifts/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, comment, withdraw: false }),
    });
    setLoading(false);
    setOpen(false);
    setComment("");
    router.refresh();
  }

  async function withdraw() {
    setLoading(true);
    await fetch("/api/shifts/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, withdraw: true }),
    });
    setLoading(false);
    router.refresh();
  }

  if (currentStatus === "confirmed") {
    return (
      <div className="flex items-center gap-2 pt-3 border-t border-sun-border">
        <span className="text-xs font-medium px-2 py-1 bg-status-confirmed-bg text-status-confirmed-text rounded-full">
          Confirmed ✓
        </span>
        {currentComment && (
          <p className="text-xs text-sun-mute italic">"{currentComment}"</p>
        )}
      </div>
    );
  }

  if (currentStatus === "pending") {
    return (
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-sun-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium px-2 py-1 bg-pending-bg text-pending-text rounded-full shrink-0">
            Interested
          </span>
          {currentComment && (
            <p className="text-xs text-sun-mute italic truncate">"{currentComment}"</p>
          )}
        </div>
        <button
          onClick={withdraw}
          disabled={loading}
          className="text-xs text-sun-mute hover:text-sun-body disabled:opacity-50 shrink-0"
        >
          {loading ? "..." : "Withdraw"}
        </button>
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="pt-3 border-t border-sun-border">
        <span className="text-xs text-sun-mute">Not selected for this shift.</span>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-sun-border">
      {open ? (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note (optional) — e.g. availability, questions..."
            className="w-full text-sm border border-sun-border rounded-[10px] px-3 py-2 resize-none focus:outline-none focus:border-sun-accent bg-sun-card"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={loading}
              className="text-sm px-4 py-1.5 bg-sun-accent text-white rounded-full font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "I'm interested"}
            </button>
            <button
              onClick={() => { setOpen(false); setComment(""); }}
              className="text-sm px-3 py-1.5 text-sun-mute hover:text-sun-body"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-sun-accent-link hover:opacity-80 font-medium"
        >
          I'm interested →
        </button>
      )}
    </div>
  );
}
