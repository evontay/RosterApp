// 180-day half-life: records from 180 days ago count half as much as today's
const HALF_LIFE_DAYS = 180;
const LAMBDA = Math.LN2 / HALF_LIFE_DAYS;

function weight(createdAt: Date): number {
  const daysAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-LAMBDA * daysAgo);
}

interface RecordInput {
  attendance: "attended" | "late" | "no_show";
  qualityFlag: "good" | "issues" | null;
  createdAt: Date;
}

export interface TrustSignals {
  reliability: number | null;  // 0–100, null if no records
  quality: number | null;      // 0–100, null if no flagged records
  recordCount: number;
}

const ATTENDANCE_VALUE: Record<string, number> = {
  attended: 1.0,
  late: 0.5,
  no_show: 0.0,
};

export function computeTrustSignals(records: RecordInput[]): TrustSignals {
  if (records.length === 0) {
    return { reliability: null, quality: null, recordCount: 0 };
  }

  // Reliability — all records contribute
  let relWeightedSum = 0;
  let relTotalWeight = 0;
  for (const r of records) {
    const w = weight(r.createdAt);
    relWeightedSum += ATTENDANCE_VALUE[r.attendance] * w;
    relTotalWeight += w;
  }
  const reliability = Math.round((relWeightedSum / relTotalWeight) * 100);

  // Quality — only flagged records contribute
  const flagged = records.filter((r) => r.qualityFlag !== null);
  let quality: number | null = null;
  if (flagged.length > 0) {
    let qWeightedSum = 0;
    let qTotalWeight = 0;
    for (const r of flagged) {
      const w = weight(r.createdAt);
      qWeightedSum += (r.qualityFlag === "good" ? 1.0 : 0.0) * w;
      qTotalWeight += w;
    }
    quality = Math.round((qWeightedSum / qTotalWeight) * 100);
  }

  return { reliability, quality, recordCount: records.length };
}
