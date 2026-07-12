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
      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-status-open-bg text-status-open-text">
        Cancelled
      </span>
    );
  }

  const done = completedSteps(status, allPaid);

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < done;
        const isActive = stepNum === done;
        const isFuture = stepNum > done;

        return (
          <div key={step} className="flex items-center gap-1.5">
            {isActive ? (
              <span className="bg-status-open-bg text-status-open-text rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap">
                ● {step}
              </span>
            ) : isFuture ? (
              <span className="border border-dashed border-sun-faint text-sun-faint rounded-full px-3 py-1 text-[11px] whitespace-nowrap">
                {step}
              </span>
            ) : (
              <span className="border border-sun-border text-sun-mute rounded-full px-3 py-1 text-[11px] whitespace-nowrap line-through">
                {step}
              </span>
            )}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 w-4 ${isDone || isActive ? "bg-sun-border" : "bg-gray-100"}`} />
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
