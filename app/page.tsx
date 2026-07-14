import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session?.user.role === "owner") redirect("/dashboard");
  if (session?.user.role === "part_timer") redirect("/home");

  return (
    <div style={{ background: "#FFFBF2", minHeight: "100vh", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "#FFFBF2", borderBottom: "1px solid #FDE8C8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: "#1F2937" }}>MyCrew <span style={{ color: "#F59E0B" }}>☀</span></span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/login" style={{ fontSize: 13, color: "#4B5563", textDecoration: "none" }}>Log in</Link>
            <Link href="/signup" style={{ background: "#F59E0B", color: "#FFFFFF", fontSize: 13, fontWeight: 500, padding: "7px 18px", borderRadius: 999, textDecoration: "none" }}>Start free</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)", gap: 32, alignItems: "center", marginBottom: 48 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 999, padding: "4px 14px", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#B45309" }}>For owners who hire the same great people again and again</span>
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 500, color: "#1F2937", lineHeight: 1.15, marginBottom: 14, marginTop: 0 }}>
              Turn part-timers into<br />your <span style={{ color: "#B45309" }}>A-team</span> <span style={{ fontSize: 30 }}>🙌</span>
            </h1>
            <p style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.7, marginBottom: 22, maxWidth: 420 }}>
              Kudos after every shift. Milestones worth chasing. Quiet reliability signals only you can see. No public ratings, no penalty for saying no — just recognition that makes your best people want to come back.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Link href="/signup" style={{ background: "#F59E0B", color: "#FFFFFF", fontSize: 14, fontWeight: 500, padding: "10px 22px", borderRadius: 999, textDecoration: "none" }}>Build your crew — free</Link>
              <a href="#how-it-works" style={{ border: "1px solid #FDE8C8", color: "#4B5563", fontSize: 14, padding: "10px 20px", borderRadius: 999, background: "#FFFFFF", textDecoration: "none" }}>See how it works</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex" }}>
                {[["🌸","#DBEAFE"],["🎸","#E9D5FF"],["🧶","#FDE68A"],["🌺","#FCE7F3"]].map(([emoji, bg], i) => (
                  <span key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: bg, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFFBF2", marginLeft: i > 0 ? -8 : 0 }}>{emoji}</span>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>Loved by craft workshops, event teams, and studios</span>
            </div>
          </div>

          {/* Floating cards */}
          <div style={{ position: "relative", minHeight: 300 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "13px 15px", maxWidth: "82%", transform: "rotate(-1.5deg)" }}>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 7 }}>Kudos from your boss 💛</div>
              <div style={{ background: "#FFFBF2", borderRadius: 12, padding: "9px 12px" }}>
                <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>"Sarah kept the kids table calm and smiling all evening. Total pro."</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Kids craft camp · 5 Jul</div>
              </div>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "13px 15px", maxWidth: "74%", marginTop: -10, marginLeft: "26%", transform: "rotate(1.2deg)", position: "relative" }}>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>Milestone unlocked</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 12, padding: "4px 11px", borderRadius: 999 }}>🏆 25 shifts</span>
                <span style={{ background: "#F9FAFB", color: "#9CA3AF", fontSize: 12, padding: "4px 11px", borderRadius: 999, border: "1px dashed #E5E7EB" }}>🎖 50 · 23 to go</span>
              </div>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: "13px 15px", maxWidth: "78%", marginTop: -8, marginLeft: "6%", transform: "rotate(-0.8deg)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#FDE68A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏺</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1F2937" }}>Pottery night</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>Sat 18 Jul · fully staffed</div>
                </div>
                <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>Confirmed ✓</span>
              </div>
            </div>

            <div style={{ background: "#FEF3C7", borderRadius: 999, padding: "5px 14px", display: "inline-block", marginTop: 10, marginLeft: "34%", transform: "rotate(2deg)" }}>
              <span style={{ fontSize: 12, color: "#92400E" }}>🙋 Priya raised her hand</span>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, paddingTop: 20, paddingBottom: 48, borderTop: "1px solid #FDE8C8", borderBottom: "1px solid #FDE8C8", marginBottom: 64 }}>
          {[
            ["Kudos, not ratings", "recognition is personal, scores never are"],
            ["Saying no is free", "declines never hurt anyone's standing"],
            ["Your crew, not a marketplace", "invite-only, people you already trust"],
          ].map(([title, sub]) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#1F2937" }}>{title}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div id="how-it-works" style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 500, color: "#1F2937", marginBottom: 6, marginTop: 0 }}>How your A-team gets built</h2>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Three habits, a few minutes each. The app does the remembering.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
            {[
              { step: "STEP 1", icon: "👥", bg: "#FEF3C7", iconColor: "#B45309", title: "Invite people you trust", body: "Your roster is invite-only. No strangers, no applicants — just the part-timers you'd hire again tomorrow." },
              { step: "STEP 2", icon: "✋", bg: "#D1FAE5", iconColor: "#065F46", title: "Let your crew raise their hands", body: "Post a shift and watch interest roll in. Confirm the right person in one tap — or assign manually, your call." },
              { step: "STEP 3", icon: "💛", bg: "#FCE7F3", iconColor: "#BE185D", title: "Recognize great work", body: "Send kudos after a shift, and quietly note who showed up strong. Recognition compounds — so does reliability." },
            ].map(({ step, icon, bg, title, body }) => (
              <div key={step} style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: 18 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 18 }}>{icon}</div>
                <div style={{ fontSize: 11, color: "#B45309", fontWeight: 500, marginBottom: 4 }}>{step}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#1F2937", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* For part-timers */}
        <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 16, padding: 24, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,0.85fr)", gap: 24, alignItems: "center", marginBottom: 64 }}>
          <div>
            <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", fontSize: 12, padding: "4px 13px", borderRadius: 999, marginBottom: 12 }}>For part-timers</div>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: "#1F2937", lineHeight: 1.3, marginBottom: 10, marginTop: 0 }}>Your work adds up here</h2>
            <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7, marginBottom: 14 }}>Every shift builds your story — hours, earnings, badges, and kudos from bosses who noticed. Pick up shifts when you want them, pass when you don't. Nobody scores you. Nobody penalizes a no.</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" as const }}>
              {["🌱 First shift", "⭐ 5 shifts", "🤝 3 teammates"].map((badge) => (
                <span key={badge} style={{ background: "#FEF3C7", color: "#92400E", fontSize: 12, padding: "4px 12px", borderRadius: 999 }}>{badge}</span>
              ))}
              <span style={{ background: "#F9FAFB", color: "#9CA3AF", fontSize: 12, padding: "4px 12px", borderRadius: 999, border: "1px dashed #E5E7EB" }}>🔥 10 shifts · next</span>
            </div>
          </div>
          <div style={{ background: "#FFFBF2", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌸</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1F2937" }}>Sarah Lim</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>27 shifts · 94 hours · $2,180 earned</div>
              </div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #FDE8C8", borderRadius: 10, padding: "9px 12px" }}>
              <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5 }}>"Setup done 20 minutes early — lifesaver!" 💛</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", paddingTop: 32, borderTop: "1px solid #FDE8C8" }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "#1F2937", marginBottom: 8, marginTop: 0 }}>Your best people are already on your roster</h2>
          <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 18 }}>Give them a reason to keep showing up.</p>
          <Link href="/signup" style={{ background: "#F59E0B", color: "#FFFFFF", fontSize: 14, fontWeight: 500, padding: "11px 26px", borderRadius: 999, textDecoration: "none" }}>Build your crew — free</Link>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>Free while you grow · no credit card · your crew joins by invite</div>
        </div>

      </div>
    </div>
  );
}
