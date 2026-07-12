"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchiveButton({ shiftId, archived }: { shiftId: string; archived: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await fetch("/api/shifts/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, archived: !archived }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-xs text-sun-mute hover:text-sun-body disabled:opacity-50"
    >
      {loading ? "..." : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
