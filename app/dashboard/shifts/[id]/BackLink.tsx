"use client";

import { useRouter } from "next/navigation";

export function BackLink() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-sun-mute hover:text-sun-body mb-4 block"
    >
      ← Back
    </button>
  );
}
