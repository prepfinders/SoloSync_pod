"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { fmtMoney } from "@/lib/format";

export interface PlatformBarDatum {
  id: string;
  name: string;
  gross: number; // session pay
  adjustments: number; // adjustment pay entries
  total: number;
  color: string;
  hourly: number | null;
}

/** Horizontal bars per platform: session pay (solid) + adjustment entries (light), labeled with the total. */
export function PlatformBarChart({ data }: { data: PlatformBarDatum[] }) {
  if (!data.length) {
    return <p className="flex h-40 items-center justify-center text-sm text-muted">No earnings in this range.</p>;
  }
  const hasAdjustments = data.some((d) => d.adjustments > 0);
  const height = Math.max(120, 36 * data.length + 16);
  return (
    <div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, left: 4, bottom: 4 }} barCategoryGap="30%">
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={96}
              tick={{ fill: "var(--text-2)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as PlatformBarDatum;
                const rows = [{ name: "Session pay", value: fmtMoney(d.gross), color: d.color }];
                if (d.adjustments) rows.push({ name: "Adjustment entries", value: fmtMoney(d.adjustments), color: d.color });
                rows.push({ name: "Total", value: fmtMoney(d.total), color: "" });
                rows.push({ name: "Per hour", value: d.hourly === null ? "—" : fmtMoney(d.hourly), color: "" });
                return <ChartTooltip title={d.name} rows={rows.map((r) => ({ ...r, color: r.color || undefined }))} />;
              }}
            />
            <Bar dataKey="gross" stackId="pay" isAnimationActive={false} radius={hasAdjustments ? 0 : [0, 4, 4, 0]}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Bar>
            <Bar dataKey="adjustments" stackId="pay" isAnimationActive={false} radius={[0, 4, 4, 0]} stroke="var(--surface)" strokeWidth={1}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} fillOpacity={0.45} />
              ))}
              <LabelList
                dataKey="total"
                position="right"
                formatter={(v) => fmtMoney(Number(v), 0)}
                style={{ fill: "var(--text-2)", fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {hasAdjustments && (
        <p className="mt-1 text-xs text-muted">Solid: session pay (base + tips + per-session adj.). Light: adjustment pay entries.</p>
      )}
    </div>
  );
}
