"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UnassignButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUnassign() {
    setLoading(true);
    await fetch("/api/shifts/unassign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-sun-mute">Remove?</span>
        <button
          onClick={handleUnassign}
          disabled={loading}
          className="text-xs text-sun-mute font-medium hover:underline disabled:opacity-50"
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
      className="text-xs border border-gray-200 text-sun-mute px-3 py-1 rounded-full hover:bg-sun-inset transition-colors"
    >
      Remove
    </button>
  );
}
