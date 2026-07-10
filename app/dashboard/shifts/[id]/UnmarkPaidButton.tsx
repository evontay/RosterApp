"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UnmarkPaidButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/shifts/unmark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-yellow-600 disabled:opacity-50"
      title="Unmark as paid"
    >
      {loading ? "..." : "Unmark"}
    </button>
  );
}
