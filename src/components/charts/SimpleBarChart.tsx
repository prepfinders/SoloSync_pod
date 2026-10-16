"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { fmtDayKey, fmtHours, fmtNum } from "@/lib/format";
import type { Bucket } from "@/lib/metrics";

function labelFor(key: string, bucket: Bucket) {
  if (bucket === "month") {
    const [y, m] = key.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", year: "2-digit" }).format(
      new Date(Date.UTC(y, m - 1, 1)),
    );
  }
  return fmtDayKey(key);
}

export type SimpleUnit = "miles" | "hours" | "number";

const FORMATS: Record<SimpleUnit, (v: number) => string> = {
  miles: (v) => `${fmtNum(v)} mi`,
  hours: (v) => fmtHours(v),
  number: (v) => fmtNum(v),
};

/** One-series bar chart (slot 1). `unit` is a plain string so server components can pass it. */
export function SimpleBarChart({
  data,
  name,
  bucket,
  unit = "number",
  height = 200,
}: {
  data: { key: string; value: number }[];
  name: string;
  bucket: Bucket;
  unit?: SimpleUnit;
  height?: number;
}) {
  const format = FORMATS[unit];
  const empty = data.every((d) => d.value === 0);
  return (
    <div style={{ height }} className="w-full">
      {empty ? (
        <p className="flex h-full items-center justify-center text-sm text-muted">Nothing in this range.</p>
      ) : (
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="25%">
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis
              dataKey="key"
              tickFormatter={(k) => labelFor(String(k), bucket)}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--grid)" }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltip
                    title={labelFor(String(label), bucket)}
                    rows={[{ name, value: format(Number(payload[0].value)), color: "var(--s1)" }]}
                  />
                ) : null
              }
            />
            <Bar dataKey="value" name={name} fill="var(--s1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
