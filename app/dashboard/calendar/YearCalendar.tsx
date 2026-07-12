"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  open: "bg-status-open-dot", filled: "bg-status-confirmed-dot",
  completed: "bg-status-logged-dot",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open", filled: "Confirmed", completed: "Logged",
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
  const searchParams = useSearchParams();
  const today = new Date();
  const todayStr = localDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [modal, setModal] = useState<{ dateStr: string; slot: Slot; shifts: Shift[] } | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [creating, setCreating] = useState(false);

  const shiftMap = new Map<string, { AM: Shift[]; PM: Shift[] }>();
  const statusCounts: Record<string, number> = {};
  for (const s of shifts) {
    const key = toDateStr(s.shiftDate);
    if (!shiftMap.has(key)) shiftMap.set(key, { AM: [], PM: [] });
    const bucket = shiftMap.get(key)!;
    if (isMorning(s.startTime)) bucket.AM.push(s);
    else bucket.PM.push(s);
    statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
  }

  function buildUrl(year: number, month: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year.toString());
    params.set("month", month.toString());
    return `/dashboard/shifts?${params}`;
  }

  function navigate(offsetMonths: number) {
    const d = new Date(startYear, startMonth + offsetMonths, 1);
    router.push(buildUrl(d.getFullYear(), d.getMonth()));
  }

  function navigateTo(year: number, month: number) {
    router.push(buildUrl(year, month));
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
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-3)}
            className="px-3 py-1.5 text-sm border border-sun-border rounded-full hover:bg-sun-inset text-sun-body"
            title="Previous 3 months"
          >
            ←
          </button>

          {/* Month / Year selectors */}
          <select
            value={startMonth}
            onChange={(e) => navigateTo(startYear, parseInt(e.target.value))}
            className="border border-sun-border rounded-full px-2 py-1.5 text-sm focus:outline-none focus:border-sun-accent"
          >
            {MONTHS.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>

          <select
            value={startYear}
            onChange={(e) => navigateTo(parseInt(e.target.value), startMonth)}
            className="border border-sun-border rounded-full px-2 py-1.5 text-sm focus:outline-none focus:border-sun-accent"
          >
            {YEAR_RANGE.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {!isCurrentMonth && (
            <button
              onClick={() => navigateTo(today.getFullYear(), today.getMonth())}
              className="px-3 py-1.5 text-sm border border-sun-border rounded-full hover:bg-sun-inset text-sun-body"
            >
              Today
            </button>
          )}

          <button
            onClick={() => navigate(3)}
            className="px-3 py-1.5 text-sm border border-sun-border rounded-full hover:bg-sun-inset text-sun-body"
            title="Next 3 months"
          >
            →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <span className="text-xs text-sun-mute font-medium uppercase tracking-wide">Status</span>
        {Object.entries(STATUS_DOT).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
            <span className="text-xs text-sun-body">{STATUS_LABEL[s] ?? s}</span>
            <span className="text-xs text-sun-mute">({statusCounts[s] ?? 0})</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-2.5 h-2.5 rounded-full bg-sun-faint border border-sun-border" />
          <span className="text-xs text-sun-mute">Empty slot (click to add)</span>
        </div>
      </div>

      {/* 3-month column */}
      <div className="space-y-4">
        {visibleMonths.map(({ year, monthIdx }) => (
          <MonthGrid
            key={`${year}-${monthIdx}`}
            year={year}
            monthIdx={monthIdx}
            monthName={MONTHS[monthIdx]}
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
  year, monthIdx, monthName, todayStr, shiftMap, onSlotClick,
}: {
  year: number; monthIdx: number; monthName: string; todayStr: string;
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
    <div className="bg-sun-card rounded-[16px] border border-sun-border p-3">
      <h3 className="text-sm font-semibold text-sun-body mb-2">
        {monthName} <span className="text-sun-mute font-normal">{year}</span>
      </h3>
      <div className="grid grid-cols-7 gap-px text-center mb-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-[9px] font-medium text-sun-mute">{d}</div>
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
              <div className={`text-xs text-center leading-none py-0.5 ${
                isToday ? "font-bold text-sun-accent-text" : "font-medium text-sun-body"
              }`}>
                {day}
              </div>
              <button
                onClick={() => onSlotClick(dateStr, "AM")}
                className={`h-2.5 rounded-sm w-full transition-colors ${
                  amShifts.length > 0
                    ? `${STATUS_DOT[amShifts[0].status]} opacity-70 hover:opacity-100`
                    : "bg-sun-faint hover:bg-sun-accent-soft"
                }`}
                title={amShifts.length > 0 ? amShifts.map((s) => s.title).join(", ") : "Add AM shift"}
              />
              <button
                onClick={() => onSlotClick(dateStr, "PM")}
                className={`h-2.5 rounded-sm w-full transition-colors ${
                  pmShifts.length > 0
                    ? `${STATUS_DOT[pmShifts[0].status]} opacity-70 hover:opacity-100`
                    : "bg-sun-faint hover:bg-sun-accent-soft"
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
      <div className="bg-sun-card rounded-[16px] shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-sun-border">
          <div>
            <p className="font-semibold text-sun-ink">{display}</p>
            <p className="text-xs text-sun-mute">{slot === "AM" ? "Morning" : "Afternoon"} shifts</p>
          </div>
          <button onClick={onClose} className="text-sun-mute hover:text-sun-body text-xl">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {!creating && !editingShift && (
            <>
              {slotShifts.length === 0 ? (
                <p className="text-sm text-sun-mute text-center py-4">🌱 No shifts yet for this slot.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {slotShifts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onEditShift(s)}
                      className="w-full text-left bg-sun-inset hover:bg-sun-accent-soft border border-sun-border rounded-[12px] p-3 transition-colors"
                    >
                      <p className="font-medium text-sm text-sun-ink">{s.title}</p>
                      <p className="text-xs text-sun-mute">{s.startTime}–{s.endTime}</p>
                      <p className="text-xs text-sun-mute">
                        {s.roles.map((r) => `${r.skillLabel} ×${r.count}`).join(", ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={onStartCreate}
                className="w-full border-2 border-dashed border-sun-border text-sun-mute hover:border-sun-accent hover:text-sun-accent-link rounded-[12px] py-3 text-sm font-medium transition-colors"
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
      <h3 className="font-semibold text-sun-ink text-sm mb-3">
        {mode === "create" ? "New shift" : "Edit shift"}
      </h3>
      <div>
        <label className="block text-xs font-medium text-sun-body mb-1">Title</label>
        <input type="text" value={form.title} onChange={(e) => setField("title", e.target.value)}
          className="w-full border border-sun-border rounded-[10px] px-3 py-1.5 text-sm focus:outline-none focus:border-sun-accent"
          placeholder="e.g. Weekend pottery workshop" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-sun-body mb-1">Date</label>
        <input type="date" value={form.shiftDate} onChange={(e) => setField("shiftDate", e.target.value)}
          className="w-full border border-sun-border rounded-[10px] px-3 py-1.5 text-sm focus:outline-none focus:border-sun-accent" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-sun-body mb-1">Start</label>
          <input type="time" value={form.startTime} onChange={(e) => setField("startTime", e.target.value)}
            className="w-full border border-sun-border rounded-[10px] px-3 py-1.5 text-sm focus:outline-none focus:border-sun-accent" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-sun-body mb-1">End</label>
          <input type="time" value={form.endTime} onChange={(e) => setField("endTime", e.target.value)}
            className="w-full border border-sun-border rounded-[10px] px-3 py-1.5 text-sm focus:outline-none focus:border-sun-accent" required />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-sun-body mb-1">Roles & pay</label>
        <RolesEditor skills={currentSkills} roles={roles}
          onChange={(r, s) => { setRoles(r); setCurrentSkills(s); }} />
      </div>
      {error && <p className="text-status-open-text text-xs">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-sun-border text-sun-body py-2 rounded-full text-sm">
          {cancelLabel ?? "Cancel"}
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-sun-accent text-white py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {loading ? "Saving..." : mode === "create" ? "Create shift" : "Save changes"}
        </button>
      </div>
      {mode === "edit" && (
        <Link href={`/dashboard/shifts/${shift!.id}`}
          className="block text-center text-xs text-sun-accent-link hover:underline pt-1">
          View full shift details →
        </Link>
      )}
    </form>
  );
}
