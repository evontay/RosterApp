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
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
          Confirmed ✓
        </span>
        {currentComment && (
          <p className="text-xs text-gray-400 italic">"{currentComment}"</p>
        )}
      </div>
    );
  }

  if (currentStatus === "pending") {
    return (
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded shrink-0">
            Interested
          </span>
          {currentComment && (
            <p className="text-xs text-gray-400 italic truncate">"{currentComment}"</p>
          )}
        </div>
        <button
          onClick={withdraw}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 shrink-0"
        >
          {loading ? "..." : "Withdraw"}
        </button>
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Not selected for this shift.</span>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-gray-100">
      {open ? (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note (optional) — e.g. availability, questions..."
            className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={loading}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "I'm interested"}
            </button>
            <button
              onClick={() => { setOpen(false); setComment(""); }}
              className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          I'm interested →
        </button>
      )}
    </div>
  );
}
