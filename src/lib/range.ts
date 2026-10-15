import { DEFAULT_TZ, addDaysToKey, dateKey, firstOfMonthKey, firstOfYearKey, zonedToUtc } from "./tz";

export type RangePreset = "today" | "7d" | "30d" | "90d" | "mtd" | "ytd" | "all" | "custom";

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "mtd", label: "Month" },
  { value: "ytd", label: "Year" },
  { value: "all", label: "All time" },
];

export interface DateRange {
  preset: RangePreset;
  fromKey: string; // inclusive, YYYY-MM-DD in user tz
  toKey: string; // inclusive
  fromIso: string; // UTC instant, inclusive
  toIso: string; // UTC instant, exclusive
  days: number;
  label: string;
}

const EARLIEST = "2026-01-01";

export type SearchParams = Record<string, string | string[] | undefined>;

export function str(sp: SearchParams, key: string) {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export function parseRange(
  sp: SearchParams,
  tz: string = DEFAULT_TZ,
  defaultPreset: RangePreset = "30d",
  now = new Date(),
): DateRange {
  const today = dateKey(now, tz);
  let preset = (str(sp, "range") as RangePreset) || defaultPreset;
  let fromKey = today;
  let toKey = today;
  const isKey = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

  switch (preset) {
    case "today":
      break;
    case "7d":
      fromKey = addDaysToKey(today, -6);
      break;
    case "90d":
      fromKey = addDaysToKey(today, -89);
      break;
    case "mtd":
      fromKey = firstOfMonthKey(now, tz);
      break;
    case "ytd":
      fromKey = firstOfYearKey(now, tz);
      break;
    case "all":
      fromKey = EARLIEST;
      break;
    case "custom": {
      const f = str(sp, "from");
      const t = str(sp, "to");
      if (isKey(f) && isKey(t) && f! <= t!) {
        fromKey = f!;
        toKey = t!;
        break;
      }
      preset = "30d";
      fromKey = addDaysToKey(today, -29);
      break;
    }
    default:
      preset = "30d";
      fromKey = addDaysToKey(today, -29);
  }

  const from = zonedToUtc(fromKey, tz);
  const to = zonedToUtc(addDaysToKey(toKey, 1), tz);
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  const label =
    preset === "custom" ? `${fromKey} → ${toKey}` : RANGE_PRESETS.find((p) => p.value === preset)?.label ?? preset;

  return { preset, fromKey, toKey, fromIso: from.toISOString(), toIso: to.toISOString(), days, label };
}

/** Builds a query string preserving range + platform filters. */
export function rangeQuery(range: DateRange, extra: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams();
  q.set("range", range.preset);
  if (range.preset === "custom") {
    q.set("from", range.fromKey);
    q.set("to", range.toKey);
  }
  for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
}
