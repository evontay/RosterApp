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
        className="text-sm font-medium text-gray-800 hover:text-blue-600 text-left"
      >
        {partTimer.name}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-80 p-6 space-y-5"
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
                <p className="font-semibold text-gray-800">{partTimer.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{partTimer.email}</p>
                {partTimer.phone && (
                  <p className="text-xs text-gray-500">{partTimer.phone}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{partTimer.completedJobs}</p>
                <p className="text-xs text-gray-400 mt-0.5">Jobs completed</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{partTimer.skills.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Skills</p>
              </div>
            </div>

            {/* Skills */}
            {partTimer.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {partTimer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
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
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setOpen(false)}
              >
                View full profile →
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-gray-400 hover:text-gray-600"
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
