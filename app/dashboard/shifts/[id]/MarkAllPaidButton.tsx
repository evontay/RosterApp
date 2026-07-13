"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkAllPaidButton({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkAllPaid() {
    setLoading(true);
    await fetch("/api/shifts/mark-all-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleMarkAllPaid}
      disabled={loading}
      className="text-sm bg-sun-accent text-sun-ink px-4 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50 font-medium"
    >
      {loading ? "..." : "Mark all paid"}
    </button>
  );
}
