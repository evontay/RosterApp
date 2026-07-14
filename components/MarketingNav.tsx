import Link from "next/link";

export function MarketingNav({ active }: { active?: "how-it-works" | "for-part-timers" }) {
  return (
    <nav style={{ background: "#FFFBF2", borderBottom: "1px solid #FDE8C8" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: "#1F2937", textDecoration: "none" }}>
          MyCrew <span style={{ color: "#F59E0B" }}>☀</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link
            href="/how-it-works"
            style={{ fontSize: 13, color: active === "how-it-works" ? "#1F2937" : "#6B7280", textDecoration: "none", fontWeight: active === "how-it-works" ? 500 : 400 }}
          >
            How it works
          </Link>
          <Link
            href="/for-part-timers"
            style={active === "for-part-timers"
              ? { fontSize: 13, background: "#FEF3C7", color: "#92400E", padding: "4px 12px", borderRadius: 999, textDecoration: "none", fontWeight: 500 }
              : { fontSize: 13, color: "#6B7280", textDecoration: "none" }}
          >
            For part-timers
          </Link>
          <Link href="/login" style={{ fontSize: 13, color: "#4B5563", textDecoration: "none" }}>Log in</Link>
          <Link href="/signup" style={{ background: "#F59E0B", color: "#FFFFFF", fontSize: 13, fontWeight: 500, padding: "7px 18px", borderRadius: 999, textDecoration: "none" }}>
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
