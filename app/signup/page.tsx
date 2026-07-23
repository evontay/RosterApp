"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", businessName: "", ownerName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but sign-in failed. Please log in manually.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sun-page">
      <div className="w-full max-w-sm">

        <div className="text-center mb-5">
          <a href="/" className="text-3xl block mb-2 hover:opacity-80">🙌</a>
          <h1 className="text-xl font-medium text-sun-ink">Start your crew</h1>
          <p className="text-xs text-sun-mute mt-1">Free for your first 5 crew members</p>
        </div>

        <div className="bg-sun-card border border-sun-border rounded-[16px] p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-sun-body mb-1">Your name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
                placeholder="Jane Tan"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sun-body mb-1">Your business name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
                placeholder="Craft Workshop Co."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sun-body mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
                placeholder="name@business.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sun-body mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="w-full border border-sun-border rounded-[10px] px-3 py-2 pr-10 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
                  placeholder="8+ characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sun-mute hover:text-sun-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              <p className="text-xs text-sun-faint mt-1">Strong passwords protect your crew's pay data</p>
            </div>

            {error && <p className="text-status-open-text text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sun-accent text-sun-ink py-2.5 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating your crew…" : "Create my crew"}
            </button>
            <p className="text-xs text-sun-mute text-center">No credit card · free while you grow</p>
          </form>
        </div>

        <div className="bg-sun-accent-soft rounded-[12px] px-4 py-3 mt-4 flex items-center gap-3">
          <span className="text-sm">✉️</span>
          <span className="text-xs text-sun-accent-text">Joining as a part-timer? Use the invite link your boss sent you — that's your door in.</span>
        </div>

        <p className="text-xs text-sun-mute text-center mt-4">
          Already have a crew?{" "}
          <a href="/login" className="text-sun-accent-link hover:underline">
            Log in
          </a>
        </p>

      </div>
    </div>
  );
}
