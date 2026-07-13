"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AVATAR_COLORS, AVATAR_COLOR_KEYS, AVATAR_EMOJIS, hashColor } from "@/components/Avatar";

interface Business {
  id: string;
  name: string;
  ownerName: string | null;
  ownerPhone: string | null;
  avatarEmoji: string | null;
  avatarColor: string | null;
  businessAddress: string | null;
}

export function OwnerProfileForm({
  business,
  email,
}: {
  business: Business;
  email: string;
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(business.name);
  const [ownerName, setOwnerName] = useState(business.ownerName ?? "");
  const [ownerPhone, setOwnerPhone] = useState(business.ownerPhone ?? "");
  const [businessAddress, setBusinessAddress] = useState(business.businessAddress ?? "");
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(business.avatarEmoji);
  const [avatarColor, setAvatarColor] = useState<string | null>(
    business.avatarColor ?? hashColor(business.id)
  );
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const displayName = ownerName || businessName;

  useEffect(() => {
    if (!avatarOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarOpen]);

  async function saveProfile(overrides?: { avatarEmoji?: string | null; avatarColor?: string | null }) {
    const res = await fetch("/api/owner/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: businessName,
        ownerName,
        ownerPhone,
        businessAddress,
        avatarEmoji: overrides?.avatarEmoji !== undefined ? overrides.avatarEmoji : avatarEmoji,
        avatarColor: overrides?.avatarColor !== undefined ? overrides.avatarColor : avatarColor,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to save");
    }
    router.refresh();
  }

  async function handleAvatarChange(emoji: string | null, color: string | null) {
    setAvatarEmoji(emoji);
    setAvatarColor(color);
    await saveProfile({ avatarEmoji: emoji, avatarColor: color });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveProfile();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setBusinessName(business.name);
    setOwnerName(business.ownerName ?? "");
    setOwnerPhone(business.ownerPhone ?? "");
    setBusinessAddress(business.businessAddress ?? "");
    setEditing(false);
    setError("");
  }

  return (
    <div ref={avatarRef} className="bg-sun-card rounded-[16px] border border-sun-border p-5 space-y-4">
      {/* Header: avatar + name + edit button */}
      <div className="flex items-center gap-4">
        <div
          className="relative shrink-0 cursor-pointer"
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          onClick={() => setAvatarOpen((o) => !o)}
        >
          <Avatar
            name={displayName}
            avatarEmoji={avatarEmoji}
            avatarColor={avatarColor}
            id={business.id}
            size="lg"
          />
          {(avatarHovered || avatarOpen) && (
            <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sun-ink">{displayName}</p>
          <p className="text-xs text-sun-mute mt-0.5">{businessName}</p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sun-mute hover:text-sun-body p-1 shrink-0"
            aria-label="Edit profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
      </div>

      {/* Inline avatar picker */}
      {avatarOpen && (
        <div className="border border-sun-border rounded-[12px] bg-sun-inset p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-sun-body mb-2">Background color</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLOR_KEYS.map((key) => {
                const { bg } = AVATAR_COLORS[key];
                const selected = avatarColor === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleAvatarChange(avatarEmoji, key)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selected ? "border-gray-700 scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: bg }}
                    title={key}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-sun-body mb-2">Avatar</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAvatarChange(null, avatarColor)}
                className={`w-9 h-9 rounded-full border-2 text-xs font-semibold transition-transform flex items-center justify-center ${
                  avatarEmoji === null
                    ? "border-sun-accent scale-110"
                    : "border-sun-border hover:border-sun-accent hover:scale-105"
                }`}
                style={
                  avatarEmoji === null
                    ? { backgroundColor: AVATAR_COLORS[avatarColor ?? "blue"].bg, color: AVATAR_COLORS[avatarColor ?? "blue"].text }
                    : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                }
                title="Use initials"
              >
                Aa
              </button>
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => handleAvatarChange(e, avatarColor)}
                  className={`w-9 h-9 rounded-full border-2 text-xl transition-transform flex items-center justify-center ${
                    avatarEmoji === e
                      ? "border-sun-accent scale-110"
                      : "border-sun-border hover:border-sun-accent hover:scale-105"
                  }`}
                  style={{ backgroundColor: "#f9fafb" }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-sun-border" />

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Business name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Your name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm bg-sun-inset text-sun-mute cursor-not-allowed"
            />
            <p className="text-xs text-sun-mute mt-1">Email cannot be changed here.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Phone</label>
            <input
              type="tel"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sun-body mb-1">Business address</label>
            <textarea
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              rows={3}
              className="w-full border border-sun-border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-sun-accent bg-sun-card resize-none"
            />
          </div>
          {error && <p className="text-status-open-text text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-sun-accent text-sun-ink px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="text-sun-mute px-4 py-2 rounded-full text-sm font-medium border border-sun-border hover:bg-sun-inset disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-sun-mute mb-0.5">Business name</p>
            <p className="text-sm text-sun-ink">{businessName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-sun-mute mb-0.5">Your name</p>
            <p className="text-sm text-sun-ink">{ownerName || <span className="text-sun-mute">Not set</span>}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-sun-mute mb-0.5">Email</p>
            <p className="text-sm text-sun-ink">{email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-sun-mute mb-0.5">Phone</p>
            <p className="text-sm text-sun-ink">{ownerPhone || <span className="text-sun-mute">Not set</span>}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-sun-mute mb-0.5">Business address</p>
            <p className="text-sm text-sun-ink whitespace-pre-line">
              {businessAddress || <span className="text-sun-mute">Not set</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
