"use client";

import { Avatar, AVATAR_COLORS, AVATAR_COLOR_KEYS, AVATAR_EMOJIS } from "./Avatar";

interface Props {
  name: string;
  id: string;
  emoji: string | null;
  color: string | null;
  onChange: (emoji: string | null, color: string | null) => void;
}

export function AvatarPicker({ name, id, emoji, color, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center">
        <Avatar name={name} avatarEmoji={emoji} avatarColor={color} id={id} size="lg" />
      </div>

      {/* Color swatches */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Background color</p>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLOR_KEYS.map((key) => {
            const { bg, text } = AVATAR_COLORS[key];
            const selected = color === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(emoji, key)}
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
          {/* Initials option */}
          <button
            type="button"
            onClick={() => onChange(null, color)}
            className={`w-9 h-9 rounded-full border-2 text-xs font-semibold transition-transform flex items-center justify-center ${
              emoji === null
                ? "border-blue-500 scale-110"
                : "border-gray-200 hover:border-gray-400 hover:scale-105"
            }`}
            style={
              emoji === null
                ? { backgroundColor: AVATAR_COLORS[color ?? "blue"].bg, color: AVATAR_COLORS[color ?? "blue"].text }
                : { backgroundColor: "#f3f4f6", color: "#6b7280" }
            }
            title="Use initials"
          >
            Aa
          </button>

          {/* Emoji options */}
          {AVATAR_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onChange(e, color)}
              className={`w-9 h-9 rounded-full border-2 text-xl transition-transform flex items-center justify-center ${
                emoji === e
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
  );
}
