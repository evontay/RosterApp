"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RolesEditor, RoleRow } from "@/components/RolesEditor";

interface Skill { id: string; label: string; defaultPayType?: string | null; defaultPayRate?: number | null }
interface ShiftRole { id: string; skillId: string; skillLabel: string; count: number; payType: string; payRate: number }
interface Assignment { id: string; name: string }
interface Shift {
  id: string; title: string; shiftDate: string;
  startTime: string; endTime: string; status: string;
  roles: ShiftRole[]; assignments: Assignment[];
}
type Slot = "AM" | "PM";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUS_DOT: Record<string, string> = {
  draft: "bg-gray-400", open: "bg-blue-500", filled: "bg-purple-500",
  completed: "bg-green-500", cancelled: "bg-red-400",
};

function isMorning(t: string) { return t < "12:00"; }
function toDateStr(iso: string) { return new Date(iso).toISOString().split("T")[0]; }
function localDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const YEAR_RANGE = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

export function YearCalendar({
  businessId, startYear, startMonth, skills, shifts,
}: {
  businessId: string;
  startYear: number;
  startMonth: number; // 0-indexed
  skills: Skill[];
  shifts: Shift[];
}) {
  const router = useRouter();
  const today = new Date();
  const todayStr = localDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [modal, setModal] = useState<{ dateStr: string; slot: Slot; shifts: Shift[] } | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [creating, setCreating] = useState(false);

  const shiftMap = new Map<string, { AM: Shift[]; PM: Shift[] }>();
  for (const s of shifts) {
    const key = toDateStr(s.shiftDate);
    if (!shiftMap.has(key)) shiftMap.set(key, { AM: [], PM: [] });
    const bucket = shiftMap.get(key)!;
    if (isMorning(s.startTime)) bucket.AM.push(s);
    else bucket.PM.push(s);
  }

  function navigate(offsetMonths: number) {
    const d = new Date(startYear, startMonth + offsetMonths, 1);
    router.push(`/dashboard/calendar?year=${d.getFullYear()}&month=${d.getMonth()}`);
  }

  function navigateTo(year: number, month: number) {
    router.push(`/dashboard/calendar?year=${year}&month=${month}`);
  }

  function openSlot(dateStr: string, slot: Slot) {
    const bucket = shiftMap.get(dateStr);
    const slotShifts = bucket?.[slot] ?? [];
    setModal({ dateStr, slot, shifts: slotShifts });
    setEditingShift(null);
    setCreating(slotShifts.length === 0);
  }

  function closeModal() {
    setModal(null);
    setEditingShift(null);
    setCreating(false);
  }

  // The 3 months to display (handles year boundaries)
  const visibleMonths = [0, 1, 2].map((offset) => {
    const d = new Date(startYear, startMonth + offset, 1);
    return { year: d.getFullYear(), monthIdx: d.getMonth() };
  });

  const isCurrentMonth = startYear === today.getFullYear() && startMonth === today.getMonth();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 shrink-0">Calendar</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-3)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Previous 3 months"
          >
            ←
          </button>

          {/* Month / Year selectors */}
          <select
            value={startMonth}
            onChange={(e) => navigateTo(startYear, parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {MONTHS.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>

          <select
            value={startYear}
            onChange={(e) => navigateTo(parseInt(e.target.value), startMonth)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {YEAR_RANGE.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {!isCurrentMonth && (
            <button
              onClick={() => navigateTo(today.getFullYear(), today.getMonth())}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Today
            </button>
          )}

          <button
            onClick={() => navigate(3)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Next 3 months"
          >
            →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</span>
        {Object.entries(STATUS_DOT).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
            <span className="text-xs text-gray-600 capitalize">{s}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200" />
          <span className="text-xs text-gray-400">Empty slot (click to add)</span>
        </div>
      </div>

      {/* 3-month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {visibleMonths.map(({ year, monthIdx }) => (
          <MonthGrid
            key={`${year}-${monthIdx}`}
            year={year}
            monthIdx={monthIdx}
            monthName={MONTHS[monthIdx]}
            showYear={year !== startYear}
            todayStr={todayStr}
            shiftMap={shiftMap}
            onSlotClick={openSlot}
          />
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <SlotModal
          dateStr={modal.dateStr}
          slot={modal.slot}
          slotShifts={modal.shifts}
          skills={skills}
          businessId={businessId}
          editingShift={editingShift}
          creating={creating}
          onEditShift={setEditingShift}
          onStartCreate={() => { setCreating(true); setEditingShift(null); }}
          onClose={closeModal}
          onSaved={() => { closeModal(); router.refresh(); }}
        />
      )}
    </div>
  );
}

function MonthGrid({
  year, monthIdx, monthName, showYear, todayStr, shiftMap, onSlotClick,
}: {
  year: number; monthIdx: number; monthName: string; showYear: boolean; todayStr: string;
  shiftMap: Map<string, { AM: Shift[]; PM: Shift[] }>;
  onSlotClick: (dateStr: string, slot: Slot) => void;
}) {
  const firstDay = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        {monthName}{showYear && <span className="text-gray-400 font-normal ml-1">{year}</span>}
      </h3>
      <div className="grid grid-cols-7 gap-px text-center mb-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-[9px] font-medium text-gray-400">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = localDateStr(year, monthIdx, day);
          const bucket = shiftMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const amShifts = bucket?.AM ?? [];
          const pmShifts = bucket?.PM ?? [];

          return (
            <div key={i} className="flex flex-col gap-px">
              <div className={`text-[10px] text-center leading-none py-0.5 font-medium rounded-sm ${
                isToday ? "bg-blue-600 text-white" : "text-gray-600"
              }`}>
                {day}
              </div>
              <button
                onClick={() => onSlotClick(dateStr, "AM")}
                className={`h-2.5 rounded-sm w-full transition-colors ${
                  amShifts.length > 0
                    ? `${STATUS_DOT[amShifts[0].status]} opacity-70 hover:opacity-100`
                    : "bg-gray-100 hover:bg-blue-100"
                }`}
                title={amShifts.length > 0 ? amShifts.map((s) => s.title).join(", ") : "Add AM shift"}
              />
              <button
                onClick={() => onSlotClick(dateStr, "PM")}
                className={`h-2.5 rounded-sm w-full transition-colors ${
                  pmShifts.length > 0
                    ? `${STATUS_DOT[pmShifts[0].status]} opacity-70 hover:opacity-100`
                    : "bg-gray-100 hover:bg-blue-100"
                }`}
                title={pmShifts.length > 0 ? pmShifts.map((s) => s.title).join(", ") : "Add PM shift"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlotModal({
  dateStr, slot, slotShifts, skills, businessId,
  editingShift, creating,
  onEditShift, onStartCreate, onClose, onSaved,
}: {
  dateStr: string; slot: Slot; slotShifts: Shift[]; skills: Skill[]; businessId: string;
  editingShift: Shift | null; creating: boolean;
  onEditShift: (s: Shift) => void; onStartCreate: () => void;
  onClose: () => void; onSaved: () => void;
}) {
  const display = new Date(dateStr + "T00:00:00").toLocaleDateString("en-SG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-800">{display}</p>
            <p className="text-xs text-gray-500">{slot === "AM" ? "Morning" : "Afternoon"} shifts</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {!creating && !editingShift && (
            <>
              {slotShifts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No shifts yet for this slot.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {slotShifts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onEditShift(s)}
                      className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg p-3 transition-colors"
                    >
                      <p className="font-medium text-sm text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.startTime}–{s.endTime}</p>
                      <p className="text-xs text-gray-500">
                        {s.roles.map((r) => `${r.skillLabel} ×${r.count}`).join(", ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={onStartCreate}
                className="w-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-lg py-3 text-sm font-medium transition-colors"
              >
                + New shift
              </button>
            </>
          )}

          {creating && (
            <ShiftForm
              mode="create"
              businessId={businessId}
              skills={skills}
              defaultDate={dateStr}
              defaultSlot={slot}
              cancelLabel={slotShifts.length > 0 ? "Back" : "Cancel"}
              onCancel={() => {
                if (slotShifts.length > 0) { onEditShift(null as unknown as Shift); }
                else onClose();
              }}
              onSaved={onSaved}
            />
          )}

          {editingShift && (
            <ShiftForm
              mode="edit"
              businessId={businessId}
              skills={skills}
              shift={editingShift}
              cancelLabel="Back"
              onCancel={() => onEditShift(null as unknown as Shift)}
              onSaved={onSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ShiftForm({
  mode, businessId, skills, defaultDate, defaultSlot, shift, cancelLabel, onCancel, onSaved,
}: {
  mode: "create" | "edit";
  businessId: string;
  skills: Skill[];
  defaultDate?: string;
  defaultSlot?: Slot;
  shift?: Shift;
  cancelLabel?: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const defaultStart = defaultSlot === "AM" ? "09:00" : "13:00";
  const defaultEnd = defaultSlot === "AM" ? "12:00" : "17:00";

  const [form, setForm] = useState({
    title: shift?.title ?? "",
    shiftDate: shift ? toDateStr(shift.shiftDate) : (defaultDate ?? ""),
    startTime: shift?.startTime ?? defaultStart,
    endTime: shift?.endTime ?? defaultEnd,
  });
  const [roles, setRoles] = useState<RoleRow[]>(
    shift?.roles.map((r) => ({ skillId: r.skillId, count: r.count, payType: r.payType, payRate: r.payRate.toString() })) ??
    [{ skillId: skills[0]?.id ?? "", count: 1, payType: skills[0]?.defaultPayType ?? "hourly", payRate: skills[0]?.defaultPayRate?.toString() ?? "" }]
  );
  const [currentSkills, setCurrentSkills] = useState<Skill[]>(skills);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (roles.length === 0) { setError("Add at least one role"); return; }
    if (roles.some((r) => !r.payRate)) { setError("Enter a pay rate for each role"); return; }
    setLoading(true);
    setError("");

    const url = mode === "create" ? "/api/shifts" : `/api/shifts/${shift!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, businessId, roles }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
    } else {
      onSaved();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">
        {mode === "create" ? "New shift" : "Edit shift"}
      </h3>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
        <input type="text" value={form.title} onChange={(e) => setField("title", e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
          placeholder="e.g. Weekend pottery workshop" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
        <input type="date" value={form.shiftDate} onChange={(e) => setField("shiftDate", e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
          <input type="time" value={form.startTime} onChange={(e) => setField("startTime", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
          <input type="time" value={form.endTime} onChange={(e) => setField("endTime", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" required />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Roles & pay</label>
        <RolesEditor skills={currentSkills} roles={roles}
          onChange={(r, s) => { setRoles(r); setCurrentSkills(s); }} />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 py-2 rounded text-sm">
          {cancelLabel ?? "Cancel"}
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Saving..." : mode === "create" ? "Create shift" : "Save changes"}
        </button>
      </div>
      {mode === "edit" && (
        <Link href={`/dashboard/shifts/${shift!.id}`}
          className="block text-center text-xs text-blue-600 hover:underline pt-1">
          View full shift details →
        </Link>
      )}
    </form>
  );
}
