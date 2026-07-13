"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function AcceptInviteForm({
  token,
  name,
  email,
}: {
  token: string;
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/my-shifts");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-sun-body mb-1">Name</label>
        <input
          type="text"
          value={name}
          disabled
          className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm bg-sun-inset text-sun-mute"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-sun-body mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm bg-sun-inset text-sun-mute"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-sun-body mb-1">Set password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-sun-body mb-1">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        {loading ? "Activating..." : "Activate account"}
      </button>
    </form>
  );
}
