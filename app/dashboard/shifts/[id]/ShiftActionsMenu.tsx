"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditShiftForm } from "./EditShiftForm";

type ShiftStatus = "open" | "filled" | "completed" | "cancelled";

interface Props {
  shiftId: string;
  currentStatus: ShiftStatus;
  shiftDate: string; // ISO string
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

export function ShiftActionsMenu({ shiftId, currentStatus, shiftDate, shift, skills }: Props) {
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

  // "Mark logged" is only available on or after the shift date
  const shiftDay = new Date(shiftDate);
  shiftDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const canMarkLogged = shiftDay <= today;

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

  async function handleUnlog() {
    setLoading("unlog");
    setMenuOpen(false);
    await fetch("/api/shifts/unlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId }),
    });
    setLoading(null);
    router.refresh();
  }

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
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => { setMenuOpen(false); setEditOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit shift
            </button>

            {/* Mark logged — only on/after shift date */}
            {(currentStatus === "open" || currentStatus === "filled") && (
              <div className="border-t border-gray-100 mt-1 pt-1">
                {canMarkLogged ? (
                  <button
                    onClick={() => handleTransition("completed")}
                    disabled={loading !== null}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loading === "completed" ? "..." : "Mark as logged"}
                  </button>
                ) : (
                  <span className="block px-4 py-2 text-sm text-gray-300 cursor-default select-none">
                    Mark as logged
                  </span>
                )}
              </div>
            )}

            {/* Unmark logged — correction */}
            {currentStatus === "completed" && (
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleUnlog}
                  disabled={loading !== null}
                  className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading === "unlog" ? "..." : "Unmark as logged"}
                </button>
              </div>
            )}

            {/* Cancel */}
            {(currentStatus === "open" || currentStatus === "filled") && (
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => handleTransition("cancelled")}
                  disabled={loading !== null}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading === "cancelled" ? "..." : "Cancel shift"}
                </button>
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
