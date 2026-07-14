"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", businessName: "", ownerName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      <div className="bg-sun-card p-8 rounded-[16px] border border-sun-border shadow-sm w-full max-w-sm">
        <a href="/" className="text-2xl font-bold mb-1 text-sun-ink block hover:opacity-80">
          MyCrew <span className="text-sun-accent">☀</span>
        </a>
        <p className="text-sm text-sun-mute mb-6">Create your owner account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Your name</label>
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
              placeholder="Jane Tan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Business name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
              placeholder="Craft Workshop Co."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          {error && <p className="text-status-open-text text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sun-accent text-sun-ink py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-sun-mute text-center mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-sun-accent-link hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
