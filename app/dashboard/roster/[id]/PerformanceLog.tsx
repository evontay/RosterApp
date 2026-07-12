const ATTENDANCE_STYLE: Record<string, { label: string; cls: string }> = {
  attended: { label: "Attended", cls: "bg-status-confirmed-bg text-status-confirmed-text" },
  late:     { label: "Late",     cls: "bg-pending-bg text-pending-text" },
  no_show:  { label: "No-show", cls: "bg-status-open-bg text-status-open-text" },
};

const QUALITY_STYLE: Record<string, { label: string; cls: string }> = {
  good:   { label: "Good",   cls: "bg-status-logged-bg text-status-logged-text" },
  issues: { label: "Issues", cls: "bg-pending-bg text-pending-text" },
};

interface LogRecord {
  attendance: "attended" | "late" | "no_show";
  qualityFlag: "good" | "issues" | null;
  comment: string | null;
  createdAt: Date;
  tags: string[];
  shift: { id: string; title: string; shiftDate: Date } | null;
}

export function PerformanceLog({ records }: { records: LogRecord[] }) {
  return (
    <div className="bg-sun-card rounded-[16px] border border-sun-border">
      <div className="px-4 py-3 border-b border-sun-border">
        <h2 className="text-sm font-semibold text-sun-body">Performance log</h2>
      </div>
      <div className="divide-y divide-sun-border">
        {records.map((r, i) => {
          const att = ATTENDANCE_STYLE[r.attendance];
          const qual = r.qualityFlag ? QUALITY_STYLE[r.qualityFlag] : null;
          return (
            <div key={i} className="px-4 py-3">
              {/* Shift + date */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-sun-body">
                  {r.shift?.title ?? "Shift"}
                  {r.shift && (
                    <span className="text-sun-mute font-normal ml-1.5">
                      {new Date(r.shift.shiftDate).toLocaleDateString("en-SG", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  )}
                </p>
                <span className="text-xs text-sun-mute shrink-0">
                  {r.createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short" })}
                </span>
              </div>

              {/* Badges + tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${att.cls}`}>{att.label}</span>
                {qual && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${qual.cls}`}>{qual.label}</span>
                )}
                {r.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs bg-sun-inset text-sun-body">{tag}</span>
                ))}
              </div>

              {/* Comment */}
              {r.comment && (
                <p className="text-xs text-sun-body italic">"{r.comment}"</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
