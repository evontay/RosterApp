const STATUS_DOT: Record<string, string> = {
  draft: "bg-gray-400",
  open: "bg-blue-500",
  filled: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-400",
};

const STATUS_ORDER = ["draft", "open", "filled", "completed", "cancelled"] as const;

export function StatusLegend({ counts }: { counts: Partial<Record<string, number>> }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</span>
      {STATUS_ORDER.map((status) => {
        const count = counts[status] ?? 0;
        return (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_DOT[status]}`} />
            <span className="text-xs text-gray-600 capitalize">{status}</span>
            <span className="text-xs text-gray-400">({count})</span>
          </div>
        );
      })}
    </div>
  );
}
