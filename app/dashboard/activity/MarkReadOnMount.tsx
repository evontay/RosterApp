"use client";

import { useEffect } from "react";

export function MarkReadOnMount() {
  useEffect(() => {
    fetch("/api/activity/read", { method: "POST" });
  }, []);
  return null;
}
