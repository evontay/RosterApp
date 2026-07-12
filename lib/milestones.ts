export interface MilestoneDefinition {
  id: string;
  label: string;
  description: string;
  emoji: string;
  check: (stats: MilestoneStats) => boolean;
}

export interface MilestoneStats {
  completedShifts: number;
  uniqueCoworkers: number;
}

export const MILESTONES: MilestoneDefinition[] = [
  {
    id: "first_shift",
    emoji: "⭐",
    label: "First shift",
    description: "Completed your first shift",
    check: (s) => s.completedShifts >= 1,
  },
  {
    id: "5_shifts",
    emoji: "🔥",
    label: "On a roll",
    description: "Completed 5 shifts",
    check: (s) => s.completedShifts >= 5,
  },
  {
    id: "10_shifts",
    emoji: "💪",
    label: "10 shifts",
    description: "Completed 10 shifts",
    check: (s) => s.completedShifts >= 10,
  },
  {
    id: "25_shifts",
    emoji: "🏅",
    label: "25 shifts",
    description: "Completed 25 shifts",
    check: (s) => s.completedShifts >= 25,
  },
  {
    id: "50_shifts",
    emoji: "🏆",
    label: "50 shifts",
    description: "Completed 50 shifts",
    check: (s) => s.completedShifts >= 50,
  },
  {
    id: "3_teammates",
    emoji: "🤝",
    label: "Team player",
    description: "Worked alongside 3 different teammates",
    check: (s) => s.uniqueCoworkers >= 3,
  },
  {
    id: "10_teammates",
    emoji: "🌟",
    label: "Well connected",
    description: "Worked alongside 10 different teammates",
    check: (s) => s.uniqueCoworkers >= 10,
  },
];

export function computeMilestones(stats: MilestoneStats) {
  const unlocked = MILESTONES.filter((m) => m.check(stats));
  const next = MILESTONES.find((m) => !m.check(stats)) ?? null;
  return { unlocked, next };
}
