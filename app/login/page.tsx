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
      <div className="bg-sun-card p-8 rounded-[16px] border border-sun-border shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-sun-ink">MyCrew <span className="text-sun-accent">☀</span></h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
              required
            />
          </div>
          {error && <p className="text-status-open-text text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sun-accent text-sun-ink py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-xs text-sun-mute text-center mt-5">
          New owner?{" "}
          <a href="/signup" className="text-sun-accent-link hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
