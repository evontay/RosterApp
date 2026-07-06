"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AVATAR_COLORS, AVATAR_COLOR_KEYS, AVATAR_EMOJIS, hashColor } from "@/components/Avatar";

interface PartTimer {
  id: string;
  name: string;
  phone: string | null;
  avatarEmoji: string | null;
  avatarColor: string | null;
  availability: { id: string; dayOfWeek: string; preference: string }[];
}

export function ProfileForm({ partTimer, memberSince }: { partTimer: PartTimer; memberSince: Date | null }) {
  const router = useRouter();
  const [name, setName] = useState(partTimer.name);
  const [phone, setPhone] = useState(partTimer.phone ?? "");
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(partTimer.avatarEmoji);
  const [avatarColor, setAvatarColor] = useState<string | null>(
    partTimer.avatarColor ?? hashColor(partTimer.id)
  );
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

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
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        avatarEmoji: overrides?.avatarEmoji !== undefined ? overrides.avatarEmoji : avatarEmoji,
        avatarColor: overrides?.avatarColor !== undefined ? overrides.avatarColor : avatarColor,
      }),
    });
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
    await saveProfile();
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setName(partTimer.name);
    setPhone(partTimer.phone ?? "");
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      {/* Personal info */}
      <div ref={avatarRef} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        {/* Header: avatar + name + edit button */}
        <div className="flex items-center gap-4">
          {/* Avatar with hover edit overlay */}
          <div
            className="relative shrink-0 cursor-pointer"
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
            onClick={() => setAvatarOpen((o) => !o)}
          >
            <Avatar
              name={name || partTimer.name}
              avatarEmoji={avatarEmoji}
              avatarColor={avatarColor}
              id={partTimer.id}
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
            <p className="font-semibold text-gray-800">{name}</p>
            {memberSince && (
              <p className="text-xs text-gray-400 mt-0.5">
                Member since {memberSince.toLocaleDateString("en-SG", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
              aria-label="Edit personal info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
        </div>

        {/* Inline avatar picker */}
        {avatarOpen && (
          <div className="border border-gray-100 rounded-lg bg-gray-50 p-4 space-y-4">
            {/* Color swatches */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Background color</p>
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

            {/* Avatar options */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Avatar</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAvatarChange(null, avatarColor)}
                  className={`w-9 h-9 rounded-full border-2 text-xs font-semibold transition-transform flex items-center justify-center ${
                    avatarEmoji === null
                      ? "border-blue-500 scale-110"
                      : "border-gray-200 hover:border-gray-400 hover:scale-105"
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
                        ? "border-blue-500 scale-110"
                        : "border-gray-200 hover:border-gray-400 hover:scale-105"
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

        {/* Divider before fields */}
        <div className="border-t border-gray-100" />

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="bg-white text-gray-600 px-4 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-0.5">Name</label>
              <p className="text-sm text-gray-800">{name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-0.5">Phone</label>
              <p className="text-sm text-gray-800">{phone || <span className="text-gray-400">Not set</span>}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
