const STATUS_DOT: Record<string, string> = {
  open: "bg-status-open-dot",
  filled: "bg-status-confirmed-dot",
  completed: "bg-status-logged-dot",
  cancelled: "bg-sun-mute",
};

const STATUS_ORDER = ["open", "filled", "completed", "cancelled"] as const;

export function StatusLegend({ counts }: { counts: Partial<Record<string, number>> }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-xs text-sun-mute font-medium uppercase tracking-wide">Status</span>
      {STATUS_ORDER.map((status) => {
        const count = counts[status] ?? 0;
        return (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
            <span className="text-xs text-sun-body capitalize">{status}</span>
            <span className="text-xs text-sun-mute">({count})</span>
          </div>
        );
      })}
    </div>
  );
}
