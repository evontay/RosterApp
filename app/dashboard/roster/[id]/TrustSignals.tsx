import { TrustSignals as Signals } from "@/lib/trust";

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-sun-faint rounded-full h-1.5 mt-1.5">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function scoreColor(score: number | null): string {
  if (score === null) return "bg-sun-faint";
  if (score >= 80) return "bg-status-confirmed-dot";
  if (score >= 60) return "bg-sun-accent";
  return "bg-status-open-dot";
}

function scoreTextColor(score: number | null): string {
  if (score === null) return "text-sun-mute";
  if (score >= 80) return "text-status-confirmed-text";
  if (score >= 60) return "text-sun-accent-text";
  return "text-status-open-text";
}

export function TrustSignalsDisplay({ signals }: { signals: Signals }) {
  const { reliability, quality, recordCount } = signals;

  if (recordCount === 0) {
    return (
      <div className="bg-sun-card rounded-[16px] border border-sun-border p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-sun-body">Performance</h2>
          <span className="text-xs text-sun-mute">No records yet</span>
        </div>
        <p className="text-xs text-sun-mute">
          Records are added from completed shift pages.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-sun-card rounded-[16px] border border-sun-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-sun-body">Performance</h2>
        <span className="text-xs text-sun-mute">Based on {recordCount} shift{recordCount !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Reliability */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-sun-mute">Reliability</span>
            <span className={`text-sm font-bold ${scoreTextColor(reliability)}`}>
              {reliability !== null ? `${reliability}%` : "—"}
            </span>
          </div>
          {reliability !== null && <ScoreBar score={reliability} color={scoreColor(reliability)} />}
        </div>

        {/* Quality */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-sun-mute">Quality</span>
            <span className={`text-sm font-bold ${scoreTextColor(quality)}`}>
              {quality !== null ? `${quality}%` : "—"}
            </span>
          </div>
          {quality !== null && <ScoreBar score={quality} color={scoreColor(quality)} />}
          {quality === null && (
            <p className="text-xs text-sun-mute mt-1">No quality flags yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
