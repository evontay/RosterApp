const STEPS = ["Open", "Confirmed", "Logged", "Paid"] as const;

/** Returns how many steps are fully done (0–4). */
function completedSteps(status: string, allPaid: boolean): number {
  if (status === "completed" && allPaid) return 4;
  if (status === "completed") return 3;
  if (status === "filled") return 2;
  if (status === "open") return 1;
  return 0;
}

/** Full stepper used on the shift detail page. */
export function ShiftProgress({
  status,
  allPaid,
}: {
  status: string;
  allPaid: boolean;
}) {
  if (status === "cancelled") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-status-open-bg text-status-open-text">
        Cancelled
      </span>
    );
  }

  const done = completedSteps(status, allPaid);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isDone = stepNum <= done;
        const isActive = stepNum === done + 1;

        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isDone ? "bg-status-confirmed-dot text-white" : isActive ? "bg-sun-accent text-white" : "bg-sun-faint text-sun-mute"
              }`}
            >
              {isDone ? "✓" : stepNum}
            </div>
            <span
              className={`text-xs ${
                isDone ? "text-status-confirmed-text font-medium" : isActive ? "text-sun-accent-text font-medium" : "text-sun-faint"
              }`}
            >
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-px mx-0.5 ${isDone ? "bg-status-confirmed-dot" : "bg-sun-faint"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const BADGE: Record<string, { label: string; cls: string }> = {
  open:      { label: "Open",      cls: "bg-status-open-bg text-status-open-text" },
  filled:    { label: "Confirmed", cls: "bg-status-confirmed-bg text-status-confirmed-text" },
  completed: { label: "Logged",    cls: "bg-status-logged-bg text-status-logged-text" },
  paid:      { label: "Paid",      cls: "bg-status-paid-bg text-status-paid-text" },
  cancelled: { label: "Cancelled", cls: "bg-status-open-bg text-status-open-text" },
};

/** Compact badge for use on shift list cards. */
export function ShiftStepBadge({
  status,
  allPaid,
}: {
  status: string;
  allPaid: boolean;
}) {
  const key = status === "completed" && allPaid ? "paid" : status;
  const { label, cls } = BADGE[key] ?? BADGE.open;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

/** Static legend shown once above the shift list. */
export function ShiftLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-sun-mute">
      <span className="font-medium text-sun-body">Steps:</span>
      {STEPS.map((step, i) => (
        <span key={step} className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-sun-faint text-sun-body flex items-center justify-center text-[10px] font-bold shrink-0">
            {i + 1}
          </span>
          {step}
        </span>
      ))}
    </div>
  );
}
