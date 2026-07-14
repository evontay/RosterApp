import { MarketingNav } from "@/components/MarketingNav";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div style={{ background: "#FFFBF2", minHeight: "100vh", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <MarketingNav active="how-it-works" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", fontSize: 12, padding: "4px 14px", borderRadius: 999, marginBottom: 14 }}>How it works</div>
          <h1 style={{ fontSize: 34, fontWeight: 500, color: "#1F2937", marginBottom: 10, marginTop: 0 }}>How your A-team gets built</h1>
          <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>Three habits, a few minutes each. The app does the remembering.</p>
        </div>

        {/* Step 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1fr)", gap: 32, alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F59E0B", color: "#FFFFFF", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "#1F2937", margin: 0 }}>Invite people you trust</h2>
            </div>
            <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7, marginLeft: 42, marginTop: 0 }}>Your roster is invite-only. No strangers, no applicants — just the part-timers you'd hire again tomorrow. Add their skills once and MyCrew matches them to the right shifts forever.</p>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "14px 16px", transform: "rotate(-0.6deg)" }}>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10 }}>Your roster</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { emoji: "🌸", bg: "#DBEAFE", name: "Sarah Lim", skillBg: "#F3E8FF", skillColor: "#7C3AED", skill: "Facilitator", statusBg: "#D1FAE5", statusColor: "#065F46", status: "Active" },
                { emoji: "🎸", bg: "#E9D5FF", name: "James Wong", skillBg: "#DBEAFE", skillColor: "#1D4ED8", skill: "Setup crew", statusBg: "#FEF9C3", statusColor: "#A16207", status: "Invited ✉" },
              ].map(({ emoji, bg, name, skillBg, skillColor, skill, statusBg, statusColor, status }) => (
                <div key={name} style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 11px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: bg, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{emoji}</span>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#1F2937" }}>{name}</div>
                  <span style={{ background: skillBg, color: skillColor, fontSize: 11, padding: "2px 9px", borderRadius: 999 }}>{skill}</span>
                  <span style={{ background: statusBg, color: statusColor, fontSize: 11, padding: "2px 9px", borderRadius: 999 }}>{status}</span>
                </div>
              ))}
              <div style={{ border: "1px dashed #FDE8C8", borderRadius: 12, padding: "9px 11px", textAlign: "center" }}>
                <span style={{ fontSize: 12, color: "#B45309" }}>＋ Invite someone you trust</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", color: "#F59E0B", fontSize: 18, letterSpacing: 8, margin: "8px 0 16px" }}>· · ·</div>

        {/* Step 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,0.9fr)", gap: 32, alignItems: "center", marginBottom: 16 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "14px 16px", transform: "rotate(0.6deg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>Pottery night · Sat 18 Jul</span>
              <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, padding: "2px 9px", borderRadius: 999 }}>2 raised hands</span>
            </div>
            <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#FCE7F3", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🌺</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1F2937" }}>Priya Nair</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>14 shifts · Facilitator ✓</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#4B5563", background: "#FFFFFF", borderRadius: 8, padding: "6px 9px", marginBottom: 9 }}>"Love pottery nights — happy to stay for cleanup."</div>
              <div style={{ display: "flex", gap: 7 }}>
                <span style={{ background: "#059669", color: "#FFFFFF", fontSize: 12, fontWeight: 500, padding: "4px 14px", borderRadius: 999 }}>Confirm ✓</span>
                <span style={{ border: "1px solid #E5E7EB", color: "#9CA3AF", fontSize: 12, padding: "4px 14px", borderRadius: 999 }}>Reject</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>Rejecting is always free — it never affects anyone's record.</div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F59E0B", color: "#FFFFFF", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "#1F2937", margin: 0 }}>Let your crew raise their hands</h2>
            </div>
            <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7, marginLeft: 42, marginTop: 0 }}>Post a shift and watch interest roll in — with a note, a skill match, and their track record right there. Confirm the right person in one tap, or assign manually. Your call, always.</p>
          </div>
        </div>

        <div style={{ textAlign: "center", color: "#F59E0B", fontSize: 18, letterSpacing: 8, margin: "8px 0 16px" }}>· · ·</div>

        {/* Step 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1fr)", gap: 32, alignItems: "center", marginBottom: 56 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F59E0B", color: "#FFFFFF", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>3</div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "#1F2937", margin: 0 }}>Recognize great work</h2>
            </div>
            <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7, marginLeft: 42, marginTop: 0 }}>Send kudos after a shift, and quietly note who showed up strong. They see the recognition and unlock milestones — you see who to call first for the big night. Recognition compounds. So does reliability.</p>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "14px 16px", transform: "rotate(-0.6deg)" }}>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10 }}>After the shift</div>
            <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "10px 12px", marginBottom: 9 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 5 }}>Send kudos to Sarah 💛</div>
              <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#4B5563" }}>Kept the kids table calm and smiling all evening. Total pro.<span style={{ color: "#F59E0B" }}>|</span></div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, alignItems: "center" }}>
              <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>🏆 Sarah unlocked: 25 shifts</span>
              <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>Reliability 96%</span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>visible only to you</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", borderTop: "1px solid #FDE8C8", paddingTop: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "#1F2937", marginBottom: 8, marginTop: 0 }}>Ready to build your A-team?</h2>
          <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 20 }}>It takes about 5 minutes to set up. Your crew joins by invite.</p>
          <Link href="/signup" style={{ background: "#F59E0B", color: "#FFFFFF", fontSize: 14, fontWeight: 500, padding: "11px 26px", borderRadius: 999, textDecoration: "none" }}>Build your crew — free</Link>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>Free while you grow · no credit card needed</div>
        </div>

      </div>
    </div>
  );
}
