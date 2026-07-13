"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/roster/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, name, email, phone }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
    } else {
      setInviteLink(data.inviteUrl);
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-sun-accent text-sun-ink px-4 py-2 rounded-full text-sm font-medium hover:opacity-90"
      >
        + Invite employee
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-sun-card rounded-[16px] p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-sun-ink mb-4">Invite Employee</h2>

        {inviteLink ? (
          <div>
            <p className="text-sm text-sun-body mb-2">
              Share this invite link with <strong>{name}</strong>:
            </p>
            <div className="bg-sun-inset rounded-[10px] p-3 text-xs break-all font-mono mb-4 border border-sun-border">
              {inviteLink}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setInviteLink("");
                setName("");
                setEmail("");
                setPhone("");
              }}
              className="w-full bg-sun-accent text-sun-ink py-2 rounded-full text-sm font-medium hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-sun-body mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sun-body mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sun-body mb-1">
                Phone <span className="text-sun-mute font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent"
              />
            </div>
            {error && <p className="text-status-open-text text-sm">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-sun-border text-sun-body py-2 rounded-full text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sun-accent text-sun-ink py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Inviting..." : "Send invite"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
