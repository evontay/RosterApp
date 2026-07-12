"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function KudosButton({
  shiftId,
  partTimerId,
  existing,
}: {
  shiftId: string;
  partTimerId: string;
  existing: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(existing ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSaving(true);
    await fetch("/api/kudos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, partTimerId, message }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-yellow-600 hover:underline">
        {existing ? "Edit kudos" : "Send kudos"}
      </button>
    );
  }

  return (
    <div className="mt-1.5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
      <textarea
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Great work today…"
        rows={2}
        className="w-full border border-yellow-300 rounded px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-yellow-400 bg-white resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSend}
          disabled={saving || !message.trim()}
          className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {saving ? "Sending…" : "Send"}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}
