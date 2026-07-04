const STEPS = ["Open", "Staffed", "Completed", "Paid"] as const;

/** Returns how many steps are fully done (0–4). */
function completedSteps(status: string, allPaid: boolean): number {
  if (status === "completed" && allPaid) return 4;
  if (status === "completed") return 3;
  if (status === "filled") return 2;
  if (status === "open") return 1;
  return 0; // draft
}

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
