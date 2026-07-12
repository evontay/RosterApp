"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";

interface PartTimerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarEmoji: string | null;
  avatarColor: string | null;
  skills: string[];
  completedJobs: number;
}

export function EmployeeProfileModal({ partTimer }: { partTimer: PartTimerProfile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-sun-ink hover:text-sun-accent-link text-left"
      >
        {partTimer.name}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-sun-card rounded-[16px] shadow-xl w-80 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar
                name={partTimer.name}
                avatarEmoji={partTimer.avatarEmoji}
                avatarColor={partTimer.avatarColor}
                id={partTimer.id}
                size="lg"
              />
              <div className="min-w-0">
                <p className="font-semibold text-sun-ink">{partTimer.name}</p>
                <p className="text-xs text-sun-mute mt-0.5">{partTimer.email}</p>
                {partTimer.phone && (
                  <p className="text-xs text-sun-mute">{partTimer.phone}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sun-inset rounded-[12px] p-3 text-center">
                <p className="text-2xl font-bold text-sun-ink">{partTimer.completedJobs}</p>
                <p className="text-xs text-sun-mute mt-0.5">Jobs completed</p>
              </div>
              <div className="bg-sun-inset rounded-[12px] p-3 text-center">
                <p className="text-2xl font-bold text-sun-ink">{partTimer.skills.length}</p>
                <p className="text-xs text-sun-mute mt-0.5">Skills</p>
              </div>
            </div>

            {/* Skills */}
            {partTimer.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-sun-mute uppercase tracking-wide mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {partTimer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 bg-status-logged-bg text-status-logged-text rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Link
                href={`/dashboard/roster/${partTimer.id}`}
                className="text-sm text-sun-accent-link hover:underline"
                onClick={() => setOpen(false)}
              >
                View full profile →
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-sun-mute hover:text-sun-body"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
