"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function ShowRemovedToggle({ showRemoved, count }: { showRemoved: boolean; count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (showRemoved) {
      params.delete("showRemoved");
    } else {
      params.set("showRemoved", "true");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button
      onClick={toggle}
      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
        showRemoved
          ? "border-gray-400 text-gray-600 bg-gray-100"
          : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
      }`}
    >
      {showRemoved ? `Hide removed (${count})` : `Show removed (${count})`}
    </button>
  );
}
