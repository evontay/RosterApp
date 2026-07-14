"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const EMOJIS = ["🌸", "🎨", "🧶", "🌿", "🎸", "🏺", "🌺", "🧑‍🎨", "🎭", "🌙"];
const COLORS = ["#DBEAFE", "#E9D5FF", "#FDE68A", "#FCE7F3", "#D1FAE5"];
const SKILL_PILL_CLASSES = [
  { bg: "#F3E8FF", text: "#7C3AED", border: "#7C3AED" },
  { bg: "#FCE7F3", text: "#BE185D", border: "#BE185D" },
  { bg: "#DBEAFE", text: "#1D4ED8", border: "#1D4ED8" },
  { bg: "#D1FAE5", text: "#065F46", border: "#065F46" },
];

type Skill = { id: string; label: string };

export function AcceptInviteForm({
  token,
  name: initialName,
  email,
  businessName,
  ownerName,
  ownerAvatarEmoji,
  ownerAvatarColor,
  skills,
}: {
  token: string;
  name: string;
  email: string;
  businessName: string;
  ownerName: string;
  ownerAvatarEmoji: string | null;
  ownerAvatarColor: string;
  skills: Skill[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleSkill(id: string) {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  // Initials fallback
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, name, phone, avatarEmoji: emoji, avatarColor: color, skillIds: selectedSkills }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Owner pill */}
      <div className="flex flex-col items-center mb-2">
        <div className="inline-flex items-center gap-2 bg-sun-card border border-sun-border rounded-full px-4 py-1.5 mb-4">
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: ownerAvatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
            {ownerAvatarEmoji ?? ownerName[0].toUpperCase()}
          </div>
          <span className="text-xs text-sun-body">
            <span className="font-medium text-sun-ink">{ownerName}</span>
            {" "}from{" "}
            <span className="font-medium text-sun-ink">{businessName}</span>
          </span>
        </div>
        <h1 className="text-xl font-medium text-sun-ink text-center leading-snug">You're invited to join<br />the crew 🙌</h1>
        <p className="text-xs text-sun-mute mt-1 text-center">Pick up shifts you like, get paid what's agreed, and collect kudos along the way.</p>
      </div>

      {/* Basics */}
      <div className="bg-sun-card border border-sun-border rounded-[16px] p-4 space-y-3">
        <p className="text-xs font-medium text-sun-ink">First, the basics</p>
        <div>
          <label className="block text-xs text-sun-body mb-1">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-sun-body mb-1">Phone <span className="text-sun-faint">(optional)</span></label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+65 …"
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
            />
          </div>
          <div>
            <label className="block text-xs text-sun-body mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 pr-8 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sun-mute text-xs"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-sun-mute">Your email is already set: <span className="text-sun-body">{email}</span> — {ownerName.split(" ")[0]} used it to invite you.</p>
      </div>

      {/* Avatar */}
      <div className="bg-sun-card border border-sun-border rounded-[16px] p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium text-sun-ink">Make it yours</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-sun-mute">preview</span>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1.5px solid #F59E0B" }}>
              {emoji || <span className="text-xs font-medium text-sun-body">{initials}</span>}
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs text-sun-body mb-2">Pick your emoji</p>
          <div className="flex gap-1.5 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: "#FFFBF2",
                  border: emoji === e ? "1.5px solid #F59E0B" : "1px solid #FDE8C8",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-sun-body mb-2">Pick your colour</p>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: c,
                  border: color === c ? "2px solid #F59E0B" : "2px solid transparent",
                  cursor: "pointer",
                }}
                aria-label={`Select colour ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="bg-sun-card border border-sun-border rounded-[16px] p-4">
          <p className="text-xs font-medium text-sun-ink mb-1">What are you good at?</p>
          <p className="text-xs text-sun-mute mb-3">Helps {ownerName.split(" ")[0]} match you to the right shifts — change anytime.</p>
          <div className="flex gap-2 flex-wrap">
            {skills.map((skill, i) => {
              const selected = selectedSkills.includes(skill.id);
              const style = SKILL_PILL_CLASSES[i % SKILL_PILL_CLASSES.length];
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  style={{
                    background: selected ? style.bg : "#FFFBF2",
                    color: selected ? style.text : "#9CA3AF",
                    border: selected ? `1.5px solid ${style.border}` : "1px solid #FDE8C8",
                    fontSize: 12, padding: "5px 13px", borderRadius: 999, cursor: "pointer",
                  }}
                >
                  {skill.label}{selected ? " ✓" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-status-open-text text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sun-accent text-white py-3 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Joining…" : `Join ${businessName} 🙌`}
      </button>

      <p className="text-xs text-sun-mute text-center leading-relaxed">
        Only {businessName} can see your profile. No public listing, no ratings — and you can leave anytime.
      </p>

    </form>
  );
}
