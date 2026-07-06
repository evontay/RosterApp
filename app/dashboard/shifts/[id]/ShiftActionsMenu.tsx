"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditShiftForm } from "./EditShiftForm";

type ShiftStatus = "open" | "filled" | "completed" | "cancelled";

const TRANSITIONS: Record<ShiftStatus, { status: ShiftStatus; label: string; danger?: boolean }[]> = {
  open:      [{ status: "filled", label: "Mark filled" }, { status: "cancelled", label: "Cancel shift", danger: true }],
  filled:    [{ status: "completed", label: "Mark completed" }, { status: "cancelled", label: "Cancel shift", danger: true }],
  completed: [],
  cancelled: [],
};

interface Props {
  shiftId: string;
  currentStatus: ShiftStatus;
  shift: {
    id: string;
    title: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
    roles: { skillId: string; count: number; payType: string; payRate: number }[];
  };
  skills: {
    id: string;
    label: string;
    defaultPayType: string | null;
    defaultPayRate: number | null;
  }[];
}

export function ShiftActionsMenu({ shiftId, currentStatus, shift, skills }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleTransition(toStatus: ShiftStatus) {
    setLoading(toStatus);
    setMenuOpen(false);
    await fetch("/api/shifts/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, status: toStatus }),
    });
    setLoading(null);
    router.refresh();
  }

  const transitions = TRANSITIONS[currentStatus];

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
        >
          Actions
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => { setMenuOpen(false); setEditOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit shift
            </button>

            {transitions.length > 0 && (
              <div className="border-t border-gray-100 mt-1 pt-1">
                {transitions.map((t) => (
                  <button
                    key={t.status}
                    onClick={() => handleTransition(t.status)}
                    disabled={loading !== null}
                    className={`w-full text-left px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-50 ${
                      t.danger ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    {loading === t.status ? "..." : t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditShiftForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        shift={shift}
        skills={skills}
      />
    </>
  );
}
