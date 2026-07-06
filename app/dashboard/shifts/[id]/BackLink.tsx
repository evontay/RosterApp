"use client";

import { useRouter } from "next/navigation";

export function BackLink() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-gray-400 hover:text-gray-600 mb-4 block"
    >
      ← Back
    </button>
  );
}
