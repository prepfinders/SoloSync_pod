"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { fmtDayKey, fmtMoney } from "@/lib/format";
import type { Bucket, SeriesPoint } from "@/lib/metrics";

export interface SeriesDef {
  id: string;
  name: string;
  color: string;
}

const OTHER_ID = "__other";

function labelFor(key: string, bucket: Bucket) {
  if (bucket === "month") {
    const [y, m] = key.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", year: "2-digit" }).format(
      new Date(Date.UTC(y, m - 1, 1)),
    );
  }
  return fmtDayKey(key);
}

/** Stacked earnings by platform per bucket. Max 7 named series + "Other". */
export function EarningsChart({
  data,
  series,
  bucket,
}: {
  data: SeriesPoint[];
  series: SeriesDef[];
  bucket: Bucket;
}) {
  const named = series.slice(0, 7);
  const foldIds = new Set(series.slice(7).map((s) => s.id));
  const defs: SeriesDef[] = foldIds.size
    ? [...named, { id: OTHER_ID, name: "Other", color: "var(--s-other)" }]
    : named;

  const rows = data.map((d) => {
    const row: Record<string, number | string> = { key: d.key };
    for (const s of named) row[s.id] = d.byPlatform[s.id] ?? 0;
    if (foldIds.size) {
      row[OTHER_ID] = Object.entries(d.byPlatform)
        .filter(([id]) => foldIds.has(id))
        .reduce((a, [, v]) => a + v, 0);
    }
    return row;
  });

  const empty = data.every((d) => d.gross === 0);

  return (
    <div className="h-64 w-full">
      {empty ? (
        <p className="flex h-full items-center justify-center text-sm text-muted">No earnings in this range.</p>
      ) : (
        <ResponsiveContainer>
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="25%">
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis
              dataKey="key"
              tickFormatter={(k) => labelFor(String(k), bucket)}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--grid)" }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={(v) => `$${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : v}`}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const total = payload.reduce((a, p) => a + Number(p.value ?? 0), 0);
                const items = payload
                  .filter((p) => Number(p.value) > 0)
                  .map((p) => ({
                    name: String(p.name),
                    value: fmtMoney(Number(p.value)),
                    color: String(p.color),
                  }));
                return (
                  <ChartTooltip
                    title={`${labelFor(String(label), bucket)} · ${fmtMoney(total)}`}
                    rows={items}
                  />
                );
              }}
            />
            {defs.length > 1 && (
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-2)" }} />
            )}
            {defs.map((s, i) => (
              <Bar
                key={s.id}
                dataKey={s.id}
                name={s.name}
                stackId="gross"
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={1}
                radius={i === defs.length - 1 ? [4, 4, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
