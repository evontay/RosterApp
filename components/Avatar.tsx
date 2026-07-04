export const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  rose:    { bg: "#fce7f3", text: "#be185d" },
  orange:  { bg: "#ffedd5", text: "#c2410c" },
  amber:   { bg: "#fef3c7", text: "#b45309" },
  lime:    { bg: "#ecfccb", text: "#4d7c0f" },
  emerald: { bg: "#d1fae5", text: "#047857" },
  sky:     { bg: "#e0f2fe", text: "#0369a1" },
  blue:    { bg: "#dbeafe", text: "#1d4ed8" },
  violet:  { bg: "#ede9fe", text: "#6d28d9" },
  fuchsia: { bg: "#fdf4ff", text: "#a21caf" },
  teal:    { bg: "#ccfbf1", text: "#0f766e" },
};

export const AVATAR_COLOR_KEYS = Object.keys(AVATAR_COLORS) as (keyof typeof AVATAR_COLORS)[];

export const AVATAR_EMOJIS = [
  "🐱","🐶","🐸","🦊","🐯","🐨","🐻","🐼",
  "🦁","🐮","🐷","🦄","🐙","🐧","🦋","🦔",
];

/** Deterministic color from any string (used as fallback). */
export function hashColor(str: string): string {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLOR_KEYS[Math.abs(h) % AVATAR_COLOR_KEYS.length];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const SIZE = {
  sm: { wrap: "w-8 h-8 text-xs",  emoji: "text-base" },
  md: { wrap: "w-10 h-10 text-sm", emoji: "text-xl"  },
  lg: { wrap: "w-16 h-16 text-xl", emoji: "text-3xl" },
};

export function Avatar({
  name,
  avatarEmoji,
  avatarColor,
  id,
  size = "md",
}: {
  name: string;
  avatarEmoji?: string | null;
  avatarColor?: string | null;
  id: string;
  size?: "sm" | "md" | "lg";
}) {
  const colorKey = avatarColor && avatarColor in AVATAR_COLORS ? avatarColor : hashColor(id);
  const { bg, text } = AVATAR_COLORS[colorKey];
  const s = SIZE[size];

  return (
    <div
      className={`${s.wrap} rounded-full flex items-center justify-center font-semibold shrink-0 select-none`}
      style={{ backgroundColor: bg, color: text }}
    >
      {avatarEmoji ? (
        <span className={s.emoji}>{avatarEmoji}</span>
      ) : (
        initials(name)
      )}
    </div>
  );
}
