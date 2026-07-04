const STEPS = ["Open", "Staffed", "Completed", "Paid"] as const;

/** Returns how many steps are fully done (0–4). */
function completedSteps(status: string, allPaid: boolean): number {
  if (status === "completed" && allPaid) return 4;
  if (status === "completed") return 3;
  if (status === "filled") return 2;
  if (status === "open") return 1;
  return 0; // draft
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
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
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
                isDone ? "bg-green-500 text-white" : isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              {isDone ? "✓" : stepNum}
            </div>
            <span
              className={`text-xs ${
                isDone ? "text-green-600 font-medium" : isActive ? "text-blue-600 font-medium" : "text-gray-400"
              }`}
            >
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-px mx-0.5 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Compact badge for use on shift list cards. */
export function ShiftStepBadge({
  status,
  allPaid,
}: {
  status: string;
  allPaid: boolean;
}) {
  if (status === "cancelled") {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
        Cancelled
      </span>
    );
  }

  const done = completedSteps(status, allPaid);
  const stepNum = Math.min(done + 1, STEPS.length);
  const label = STEPS[stepNum - 1];
  const isComplete = done === STEPS.length;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        isComplete
          ? "bg-green-100 text-green-700"
          : done >= 3
          ? "bg-yellow-100 text-yellow-700"
          : done >= 2
          ? "bg-purple-100 text-purple-700"
          : done >= 1
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span className="opacity-60">{stepNum}·</span> {label}
    </span>
  );
}

/** Static legend shown once above the shift list. */
export function ShiftLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400">
      <span className="font-medium text-gray-500">Steps:</span>
      {STEPS.map((step, i) => (
        <span key={step} className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-bold shrink-0">
            {i + 1}
          </span>
          {step}
        </span>
      ))}
    </div>
  );
}
