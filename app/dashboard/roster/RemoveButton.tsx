"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchiveRestoreButton({
  membershipId,
  archived,
}: {
  membershipId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    setLoading(true);
    await fetch("/api/roster/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipId, restore: archived }),
    });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-sun-mute">{archived ? "Restore?" : "Archive?"}</span>
        <button
          onClick={handleAction}
          disabled={loading}
          className="text-xs font-medium hover:underline disabled:opacity-50 text-sun-mute"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-sun-mute hover:text-sun-body"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-sun-mute hover:text-sun-body transition-colors"
    >
      {archived ? "Restore" : "Archive"}
    </button>
  );
}
