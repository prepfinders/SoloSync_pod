"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { fmtMoney } from "@/lib/format";

export function PlatformBarChart({
  data,
}: {
  data: { id: string; name: string; gross: number; color: string; hourly: number | null }[];
}) {
  if (!data.length) {
    return <p className="flex h-40 items-center justify-center text-sm text-muted">No earnings in this range.</p>;
  }
  const height = Math.max(120, 36 * data.length + 16);
  return (
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
              const d = payload[0].payload as (typeof data)[number];
              return (
                <ChartTooltip
                  title={d.name}
                  rows={[
                    { name: "Gross", value: fmtMoney(d.gross), color: d.color },
                    { name: "Per hour", value: d.hourly === null ? "—" : fmtMoney(d.hourly) },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="gross" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.id} fill={d.color} />
            ))}
            <LabelList
              dataKey="gross"
              position="right"
              formatter={(v) => fmtMoney(Number(v), 0)}
              style={{ fill: "var(--text-2)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
