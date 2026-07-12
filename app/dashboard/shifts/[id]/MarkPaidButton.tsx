"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkPaidButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkPaid() {
    setLoading(true);
    await fetch("/api/shifts/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleMarkPaid}
      disabled={loading}
      className="text-xs bg-sun-accent text-white px-3 py-1 rounded-full hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "..." : "Mark paid"}
    </button>
  );
}
