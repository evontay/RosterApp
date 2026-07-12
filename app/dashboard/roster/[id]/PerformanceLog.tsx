const ATTENDANCE_STYLE: Record<string, { label: string; cls: string }> = {
  attended: { label: "Attended", cls: "bg-green-100 text-green-700" },
  late:     { label: "Late",     cls: "bg-yellow-100 text-yellow-700" },
  no_show:  { label: "No-show", cls: "bg-red-100 text-red-600" },
};

const QUALITY_STYLE: Record<string, { label: string; cls: string }> = {
  good:   { label: "Good",   cls: "bg-blue-100 text-blue-700" },
  issues: { label: "Issues", cls: "bg-orange-100 text-orange-700" },
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
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Performance log</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {records.map((r, i) => {
          const att = ATTENDANCE_STYLE[r.attendance];
          const qual = r.qualityFlag ? QUALITY_STYLE[r.qualityFlag] : null;
          return (
            <div key={i} className="px-4 py-3">
              {/* Shift + date */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-gray-700">
                  {r.shift?.title ?? "Shift"}
                  {r.shift && (
                    <span className="text-gray-400 font-normal ml-1.5">
                      {new Date(r.shift.shiftDate).toLocaleDateString("en-SG", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  )}
                </p>
                <span className="text-xs text-gray-400 shrink-0">
                  {r.createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short" })}
                </span>
              </div>

              {/* Badges + tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${att.cls}`}>{att.label}</span>
                {qual && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${qual.cls}`}>{qual.label}</span>
                )}
                {r.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{tag}</span>
                ))}
              </div>

              {/* Comment */}
              {r.comment && (
                <p className="text-xs text-gray-600 italic">"{r.comment}"</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
