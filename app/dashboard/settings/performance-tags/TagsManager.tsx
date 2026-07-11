"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  label: string;
  archived: boolean;
  _count: { records: number };
}

export function TagsManager({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCreate() {
    if (!newLabel.trim()) return;
    setCreating(true);
    await fetch("/api/performance/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    setNewLabel("");
    setCreating(false);
    router.refresh();
  }

  async function handleRename(id: string) {
    if (!editLabel.trim()) return;
    setLoading(id);
    await fetch("/api/performance/tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, label: editLabel.trim() }),
    });
    setEditingId(null);
    setLoading(null);
    router.refresh();
  }

  async function handleToggleArchive(id: string, archived: boolean) {
    setLoading(id);
    await fetch("/api/performance/tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived: !archived }),
    });
    setLoading(null);
    router.refresh();
  }

  const active = tags.filter((t) => !t.archived);
  const archived = tags.filter((t) => t.archived);

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New tag label…"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newLabel.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Adding…" : "Add"}
        </button>
      </div>

      {/* Active tags */}
      {active.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {active.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between px-4 py-3">
              {editingId === tag.id ? (
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(tag.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none mr-3"
                />
              ) : (
                <div>
                  <span className="text-sm text-gray-800">{tag.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{tag._count.records} uses</span>
                </div>
              )}
              <div className="flex items-center gap-3 shrink-0">
                {editingId === tag.id ? (
                  <>
                    <button
                      onClick={() => handleRename(tag.id)}
                      disabled={loading === tag.id}
                      className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingId(tag.id); setEditLabel(tag.label); }}
                      className="text-xs text-gray-400 hover:text-gray-700"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleToggleArchive(tag.id, tag.archived)}
                      disabled={loading === tag.id}
                      className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      Archive
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {active.length === 0 && (
        <p className="text-sm text-gray-400">No tags yet. Add one above.</p>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Archived</h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {archived.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-400">{tag.label}</span>
                <button
                  onClick={() => handleToggleArchive(tag.id, tag.archived)}
                  disabled={loading === tag.id}
                  className="text-xs text-gray-400 hover:text-blue-600 disabled:opacity-50"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
