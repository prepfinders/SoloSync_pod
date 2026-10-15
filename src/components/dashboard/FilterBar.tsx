"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RANGE_PRESETS, type RangePreset } from "@/lib/range";

export interface FilterState {
  preset: RangePreset;
  fromKey: string;
  toKey: string;
  platformId?: string;
}

export function FilterBar({
  value,
  platforms,
  basePath = "/",
  showPlatform = true,
}: {
  value: FilterState;
  platforms: { id: string; name: string }[];
  basePath?: string;
  showPlatform?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [customOpen, setCustomOpen] = useState(value.preset === "custom");
  const [from, setFrom] = useState(value.fromKey);
  const [to, setTo] = useState(value.toKey);

  const push = (next: Partial<FilterState>) => {
    const s = { ...value, ...next };
    const q = new URLSearchParams();
    q.set("range", s.preset);
    if (s.preset === "custom") {
      q.set("from", s.fromKey);
      q.set("to", s.toKey);
    }
    if (s.platformId) q.set("platform", s.platformId);
    start(() => router.push(`${basePath}?${q.toString()}`));
  };

  return (
    <div
      className={`mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-2 ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-wrap gap-1" role="group" aria-label="Date range">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              setCustomOpen(false);
              push({ preset: p.value });
            }}
            className={`chip ${value.preset === p.value ? "chip-active" : "hover:bg-surface-2"}`}
            aria-pressed={value.preset === p.value}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomOpen((o) => !o)}
          className={`chip ${value.preset === "custom" ? "chip-active" : "hover:bg-surface-2"}`}
          aria-pressed={value.preset === "custom"}
        >
          Custom
        </button>
      </div>

      {customOpen && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (from && to && from <= to) push({ preset: "custom", fromKey: from, toKey: to });
          }}
        >
          <input className="input !w-auto !py-1 text-xs" type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
          <span className="text-xs text-muted">to</span>
          <input className="input !w-auto !py-1 text-xs" type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
          <button type="submit" className="btn-ghost !py-1 text-xs">
            Apply
          </button>
        </form>
      )}

      {showPlatform && (
        <select
          className="input ml-auto !w-auto !py-1 text-xs"
          value={value.platformId ?? ""}
          onChange={(e) => push({ platformId: e.target.value || undefined })}
          aria-label="Platform"
        >
          <option value="">All platforms</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
