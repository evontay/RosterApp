import { TrustSignals as Signals } from "@/lib/trust";

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function scoreColor(score: number | null): string {
  if (score === null) return "bg-gray-300";
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-400";
  return "bg-red-400";
}

function scoreTextColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-yellow-700";
  return "text-red-600";
}

export function TrustSignalsDisplay({ signals }: { signals: Signals }) {
  const { reliability, quality, recordCount } = signals;

  if (recordCount === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-700">Performance</h2>
          <span className="text-xs text-gray-400">No records yet</span>
        </div>
        <p className="text-xs text-gray-400">
          Records are added from completed shift pages.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Performance</h2>
        <span className="text-xs text-gray-400">Based on {recordCount} shift{recordCount !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Reliability */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Reliability</span>
            <span className={`text-sm font-bold ${scoreTextColor(reliability)}`}>
              {reliability !== null ? `${reliability}%` : "—"}
            </span>
          </div>
          {reliability !== null && <ScoreBar score={reliability} color={scoreColor(reliability)} />}
        </div>

        {/* Quality */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Quality</span>
            <span className={`text-sm font-bold ${scoreTextColor(quality)}`}>
              {quality !== null ? `${quality}%` : "—"}
            </span>
          </div>
          {quality !== null && <ScoreBar score={quality} color={scoreColor(quality)} />}
          {quality === null && (
            <p className="text-xs text-gray-400 mt-1">No quality flags yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
