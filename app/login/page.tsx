"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sun-page">
      <div className="w-full max-w-sm">

        <div className="text-center mb-5">
          <a href="/" className="text-3xl block mb-2 hover:opacity-80">☀</a>
          <h1 className="text-xl font-medium text-sun-ink">Welcome back</h1>
          <p className="text-xs text-sun-mute mt-1">Your crew's been busy — come see</p>
        </div>

        <div className="bg-sun-card border border-sun-border rounded-[16px] p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-sun-body mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
                placeholder="owner@craftworkshop.com"
                required
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-sun-body">Password</label>
                <span className="text-xs text-sun-accent-link cursor-pointer">Forgot it?</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-sun-border rounded-[10px] px-3 py-2 pr-10 text-sm focus:outline-none focus:border-sun-accent bg-sun-inset"
                  required
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
            </div>
            {error && <p className="text-status-open-text text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sun-accent text-white py-2.5 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-xs text-sun-mute text-center mt-4">
          New here?{" "}
          <a href="/signup" className="text-sun-accent-link hover:underline">
            Start your crew free
          </a>
        </p>

      </div>
    </div>
  );
}
