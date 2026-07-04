"use client";

import { useState } from "react";
import Link from "next/link";
import { ShiftStepBadge } from "./ShiftProgress";
import { ArchiveButton } from "./ArchiveButton";

interface ArchivedShift {
  id: string;
  title: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  status: string;
  roles: { id: string; skill: { label: string }; count: number; payType: string; payRate: number }[];
  assignments: { id: string; partTimer: { name: string }; paymentStatus: string }[];
}

export function ArchivedSection({ shifts }: { shifts: ArchivedShift[] }) {
  const [open, setOpen] = useState(false);

  if (shifts.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-3"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        Archived shifts ({shifts.length})
      </button>

      {open && (
        <div className="space-y-3 opacity-60">
          {shifts.map((shift) => {
            const allPaid =
              shift.assignments.length > 0 &&
              shift.assignments.every((a) => a.paymentStatus === "paid");

            return (
              <div key={shift.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/shifts/${shift.id}`}
                      className="font-bold text-gray-800 hover:text-blue-600"
                    >
                      {shift.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(shift.shiftDate).toLocaleDateString("en-SG", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {shift.startTime}–{shift.endTime} · {shift.roles.map((r) => `${r.skill.label} ×${r.count}`).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ShiftStepBadge status={shift.status} allPaid={allPaid} />
                    <ArchiveButton shiftId={shift.id} archived={true} />
                  </div>
                </div>
                {shift.assignments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2 flex-wrap">
                      {shift.assignments.map((a) => (
                        <span key={a.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {a.partTimer.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
