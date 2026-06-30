"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface Assignment {
  id: string;
  name: string;
  status: string;
  paymentStatus: string;
}

interface Shift {
  id: string;
  title: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
  role: string;
  payType: string;
  payRate: number;
  assignments: Assignment[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 border-gray-300 text-gray-600",
  open: "bg-blue-50 border-blue-300 text-blue-800",
  filled: "bg-purple-50 border-purple-300 text-purple-800",
  completed: "bg-green-50 border-green-300 text-green-800",
  cancelled: "bg-red-50 border-red-200 text-red-500 line-through opacity-60",
};

export function CalendarView({
  weekStart,
  shifts,
}: {
  weekStart: string;
  shifts: Shift[];
}) {
  const router = useRouter();
  const monday = new Date(weekStart);

  // Build the 7 days of this week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  function isMorning(startTime: string) {
    return startTime < "12:00";
  }

  function shiftsForDay(day: Date, slot: "morning" | "afternoon") {
    const dayStr = day.toISOString().split("T")[0];
    return shifts.filter((s) => {
      const sDay = new Date(s.shiftDate).toISOString().split("T")[0];
      return sDay === dayStr && (slot === "morning" ? isMorning(s.startTime) : !isMorning(s.startTime));
    });
  }

  function navigate(offset: number) {
    const d = new Date(monday);
    d.setDate(d.getDate() + offset * 7);
    router.push(`/dashboard/calendar?week=${d.toISOString().split("T")[0]}`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthLabel = monday.toLocaleDateString("en-SG", { month: "long", year: "numeric" });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">{monthLabel}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Prev
          </button>
          <button
            onClick={() =>
              router.push(
                `/dashboard/calendar?week=${new Date().toISOString().split("T")[0]}`
              )
            }
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={() => navigate(1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Next →
          </button>
          <Link
            href="/dashboard/shifts/new"
            className="ml-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New shift
          </Link>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {days.map((day, i) => {
          const isToday = day.getTime() === today.getTime();
          return (
            <div key={i} className="text-center pb-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {DAY_LABELS[i]}
              </p>
              <p
                className={`text-lg font-semibold mt-0.5 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                  isToday ? "bg-blue-600 text-white" : "text-gray-700"
                }`}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}

        {/* Morning row */}
        <div className="col-span-7 grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const morning = shiftsForDay(day, "morning");
            return (
              <DaySlot key={i} label="AM" shifts={morning} />
            );
          })}
        </div>

        {/* Divider label */}
        <div className="col-span-7 flex items-center gap-2 my-1">
          <div className="flex-1 border-t border-dashed border-gray-200" />
          <span className="text-xs text-gray-400 font-medium">Afternoon</span>
          <div className="flex-1 border-t border-dashed border-gray-200" />
        </div>

        {/* Afternoon row */}
        <div className="col-span-7 grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const afternoon = shiftsForDay(day, "afternoon");
            return (
              <DaySlot key={i} label="PM" shifts={afternoon} />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
        {Object.entries(STATUS_COLORS)
          .filter(([s]) => s !== "cancelled")
          .map(([status, cls]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded border ${cls}`} />
              <span className="text-xs text-gray-500 capitalize">{status}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function DaySlot({ label, shifts }: { label: string; shifts: Shift[] }) {
  return (
    <div className="min-h-[100px] bg-white rounded-lg border border-gray-100 p-1.5 space-y-1">
      {shifts.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <span className="text-xs text-gray-200">{label}</span>
        </div>
      ) : (
        shifts.map((s) => <ShiftCard key={s.id} shift={s} />)
      )}
    </div>
  );
}

function ShiftCard({ shift }: { shift: Shift }) {
  const colorClass = STATUS_COLORS[shift.status] ?? "bg-gray-50 border-gray-200 text-gray-700";

  return (
    <Link href={`/dashboard/shifts/${shift.id}`}>
      <div
        className={`rounded border px-2 py-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
      >
        <p className="font-semibold truncate leading-tight">{shift.title}</p>
        <p className="text-[10px] opacity-70 mt-0.5">
          {shift.startTime}–{shift.endTime}
        </p>
        <p className="text-[10px] opacity-70">{shift.role}</p>
        {shift.assignments.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-0.5">
            {shift.assignments.map((a) => (
              <span
                key={a.id}
                className="bg-white/60 rounded px-1 text-[10px] font-medium truncate max-w-full"
              >
                {a.name.split(" ")[0]}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
