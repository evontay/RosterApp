import { MarketingNav } from "@/components/MarketingNav";
import Link from "next/link";

export default function ForPartTimersPage() {
  return (
    <div style={{ background: "#FFFBF2", minHeight: "100vh", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <MarketingNav active="for-part-timers" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,0.95fr)", gap: 32, alignItems: "center", marginBottom: 48 }}>
          <div>
            <div style={{ display: "inline-block", background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 999, padding: "4px 14px", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#B45309" }}>For the people who make the shift happen</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 500, color: "#1F2937", lineHeight: 1.15, marginBottom: 14, marginTop: 0 }}>
              Every shift you work<br /><span style={{ color: "#B45309" }}>adds up</span> 🌱
            </h1>
            <p style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.7, marginBottom: 22, maxWidth: 420 }}>
              Hours, earnings, badges, and kudos from bosses who noticed — all in one place that's yours. Pick up shifts when you want them. Pass when you don't. Nobody scores you, and saying no never costs you a thing.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
              <Link href="/login" style={{ background: "#F59E0B", color: "#FFFFFF", fontSize: 13, fontWeight: 500, padding: "9px 20px", borderRadius: 999, textDecoration: "none" }}>Got an invite? Join your crew</Link>
              <span style={{ fontSize: 13, color: "#B45309" }}>No invite yet? Tell your boss →</span>
            </div>
          </div>

          {/* Profile cards */}
          <div style={{ position: "relative" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: 16, transform: "rotate(-1deg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🌸</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#1F2937" }}>Sarah Lim</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>Craft Workshop Co.</div>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <div style={{ background: "#FFFBF2", borderRadius: 10, padding: "5px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#1F2937" }}>27</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>shifts</div>
                  </div>
                  <div style={{ background: "#FFFBF2", borderRadius: 10, padding: "5px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#B45309" }}>$2,180</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>earned</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>🏆 25 shifts</span>
                <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>🤝 10 teammates</span>
                <span style={{ background: "#F9FAFB", color: "#9CA3AF", fontSize: 11, padding: "3px 10px", borderRadius: 999, border: "1px dashed #E5E7EB" }}>🎖 50 · 23 to go</span>
              </div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "12px 14px", maxWidth: "85%", marginTop: -8, marginLeft: "12%", transform: "rotate(1.2deg)", position: "relative" }}>
              <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5 }}>"Sarah kept the kids table calm and smiling all evening. Total pro." 💛</div>
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>Kids craft camp · 5 Jul</div>
            </div>
            <div style={{ background: "#FEF3C7", borderRadius: 999, padding: "5px 14px", display: "inline-block", marginTop: 10, marginLeft: "6%", transform: "rotate(-2deg)" }}>
              <span style={{ fontSize: 12, color: "#92400E" }}>🙋 You raised your hand for Pottery night</span>
            </div>
          </div>
        </div>

        {/* Benefit cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14, marginBottom: 40 }}>
          {[
            { icon: "✋", bg: "#FEF3C7", title: "Work on your terms", body: "See every open shift, raise your hand for the ones that fit your life, and withdraw anytime before you're confirmed. Passing on a shift never counts against you." },
            { icon: "💛", bg: "#D1FAE5", title: "Get noticed, not rated", body: "No stars, no public scores. Just kudos when you nail it and badges as your shifts stack up — recognition you can actually feel good about." },
            { icon: "💰", bg: "#DBEAFE", title: "Know what you're owed", body: "Every shift shows the rate up front, every hour is logged, and you can see exactly what's been paid and what's coming. No chasing, no guessing." },
          ].map(({ icon, bg, title, body }) => (
            <div key={title} style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 18 }}>{icon}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#1F2937", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Joining steps */}
        <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "22px 24px", marginBottom: 48 }}>
          <h2 style={{ fontSize: 17, fontWeight: 500, color: "#1F2937", textAlign: "center", marginBottom: 20, marginTop: 0 }}>Joining takes about a minute</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
            {[
              { icon: "✉️", title: "Get invited", body: "Your boss sends you a link — that's the only way in" },
              { icon: "🎨", title: "Make it yours", body: "Pick your emoji avatar, set your skills and the days you like to work" },
              { icon: "🙋", title: "Raise your hand", body: "Browse open shifts and grab the ones that fit" },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#1F2937", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", borderTop: "1px solid #FDE8C8", paddingTop: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "#1F2937", marginBottom: 8, marginTop: 0 }}>Your next shift is waiting</h2>
          <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 20 }}>MyCrew is invite-only — if your boss isn't on it yet, they'll thank you for the tip.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" as const }}>
            <Link href="/login" style={{ background: "#F59E0B", color: "#FFFFFF", fontSize: 14, fontWeight: 500, padding: "11px 22px", borderRadius: 999, textDecoration: "none" }}>Join with your invite link</Link>
            <Link href="/" style={{ border: "1px solid #FDE8C8", background: "#FFFFFF", color: "#4B5563", fontSize: 14, padding: "11px 20px", borderRadius: 999, textDecoration: "none" }}>Share MyCrew with your boss</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
