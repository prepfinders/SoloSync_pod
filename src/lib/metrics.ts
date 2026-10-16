import type { Expense, GigPlatform, GigSession, UserProfile } from "./types";

/** IRS standard mileage rate used by the iOS app (2026). */
export const IRS_MILEAGE_RATE = 0.725;

export function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Miles the app counts as "engaged" (user-editable override falls back to GPS total). */
export function effectiveEngagedMiles(s: GigSession) {
  return s.engaged_miles === null || s.engaged_miles === undefined
    ? num(s.total_miles)
    : num(s.engaged_miles);
}

/** Gross pay for a session: base earnings + tips + per-session adjustment pay. */
export function sessionGross(s: GigSession) {
  return num(s.earnings) + num(s.tips) + num(s.adjustment_pay);
}

export function sessionTaxDeduction(s: GigSession) {
  return num(s.tax_deductible_miles) * IRS_MILEAGE_RATE;
}

export function sessionHourly(s: GigSession) {
  const hours = num(s.total_engaged_seconds) / 3600;
  return hours > 0 ? sessionGross(s) / hours : null;
}

export function sessionPerMile(s: GigSession) {
  const miles = effectiveEngagedMiles(s);
  return miles > 0 ? sessionGross(s) / miles : null;
}

/** An adjustment pay entry resolved to a server platform id (or null). */
export interface AdjustmentRow {
  platformId: string | null;
  amount: number;
  date: string; // ISO instant (entry_date)
}

export interface Totals {
  sessions: number;
  engagedHours: number;
  breakHours: number;
  miles: number;
  taxDeductibleMiles: number;
  earnings: number;
  tips: number;
  /** Per-session adjustment pay stored on sessions (part of gross). */
  sessionAdjustments: number;
  gross: number;
  safetyFees: number;
  energyKwh: number;
  irsDeduction: number;
  expenses: number;
  /** Separate adjustment pay entries (pay-period top-ups, bonuses). */
  adjustmentPay: number;
  /** gross + adjustmentPay: everything paid in the range. */
  totalPay: number;
  /** Gross − IRS deduction − expenses − safety fees (same formula as the app). */
  taxableIncome: number;
  /** Prop 22 style reimbursement at the user's mileage rate. */
  mileageReimbursement: number;
  energyCost: number;
  avgHourly: number | null;
  avgPerMile: number | null;
}

export function breakSeconds(s: GigSession) {
  return (s.break_periods ?? []).reduce((acc, b) => {
    const end = b.end_time ? new Date(b.end_time) : new Date();
    return acc + Math.max(0, (end.getTime() - new Date(b.start_time).getTime()) / 1000);
  }, 0);
}

export function computeTotals(
  sessions: GigSession[],
  expenses: Expense[],
  adjustmentPay: number,
  profile: Pick<UserProfile, "mileage_reimbursement_rate" | "energy_cost_per_kwh"> | null,
): Totals {
  const completed = sessions.filter((s) => s.status === "completed");
  const engagedSeconds = completed.reduce((a, s) => a + num(s.total_engaged_seconds), 0);
  const breakSecs = completed.reduce((a, s) => a + breakSeconds(s), 0);
  const miles = completed.reduce((a, s) => a + effectiveEngagedMiles(s), 0);
  const taxDeductibleMiles = completed.reduce((a, s) => a + num(s.tax_deductible_miles), 0);
  const earnings = completed.reduce((a, s) => a + num(s.earnings), 0);
  const tips = completed.reduce((a, s) => a + num(s.tips), 0);
  const sessionAdjustments = completed.reduce((a, s) => a + num(s.adjustment_pay), 0);
  const safetyFees = completed.reduce((a, s) => a + num(s.safety_admin_fee), 0);
  const energyKwh = completed.reduce((a, s) => a + num(s.energy_used), 0);
  const irsDeduction = taxDeductibleMiles * IRS_MILEAGE_RATE;
  const expenseTotal = expenses.reduce((a, e) => a + num(e.amount), 0);
  const gross = earnings + tips + sessionAdjustments;
  const hours = engagedSeconds / 3600;
  const totalPay = gross + adjustmentPay;
  const mileageRate = num(profile?.mileage_reimbursement_rate) || 0.37;
  const kwhRate = num(profile?.energy_cost_per_kwh) || 0.227;

  return {
    sessions: completed.length,
    engagedHours: hours,
    breakHours: breakSecs / 3600,
    miles,
    taxDeductibleMiles,
    earnings,
    tips,
    sessionAdjustments,
    gross,
    safetyFees,
    energyKwh,
    irsDeduction,
    expenses: expenseTotal,
    adjustmentPay,
    totalPay,
    taxableIncome: totalPay - irsDeduction - expenseTotal - safetyFees,
    mileageReimbursement: miles * mileageRate,
    energyCost: energyKwh * kwhRate,
    avgHourly: hours > 0 ? totalPay / hours : null,
    avgPerMile: miles > 0 ? totalPay / miles : null,
  };
}

export type Bucket = "day" | "week" | "month";

/** Picks a chart bucket from a span in days so bar counts stay readable. */
export function bucketForSpan(days: number): Bucket {
  if (days <= 62) return "day";
  if (days <= 400) return "week";
  return "month";
}

/** Maps a "YYYY-MM-DD" key to its bucket key (Monday for weeks, 1st for months). */
export function bucketKey(dayKey: string, bucket: Bucket) {
  if (bucket === "day") return dayKey;
  const [y, m, d] = dayKey.split("-").map(Number);
  if (bucket === "month") return `${y}-${String(m).padStart(2, "0")}-01`;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = (dt.getUTCDay() + 6) % 7; // Monday = 0
  dt.setUTCDate(dt.getUTCDate() - dow);
  return dt.toISOString().slice(0, 10);
}

function nextBucketKey(key: string, bucket: Bucket) {
  const [y, m, d] = key.split("-").map(Number);
  if (bucket === "month") return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  return new Date(Date.UTC(y, m - 1, d + (bucket === "week" ? 7 : 1))).toISOString().slice(0, 10);
}

export interface SeriesPoint {
  key: string; // bucket start, YYYY-MM-DD
  gross: number;
  miles: number;
  hours: number;
  byPlatform: Record<string, number>; // platform id -> gross
}

export function groupByBucket(
  sessions: GigSession[],
  dayKeyOf: (iso: string) => string,
  fromKey: string,
  toKey: string,
  bucket: Bucket,
  adjustments: AdjustmentRow[] = [],
): SeriesPoint[] {
  const map = new Map<string, SeriesPoint>();
  const first = bucketKey(fromKey, bucket);
  const last = bucketKey(toKey, bucket);
  // Pre-fill every bucket so gaps render as zero bars.
  for (let k = first; k <= last; k = nextBucketKey(k, bucket)) {
    map.set(k, { key: k, gross: 0, miles: 0, hours: 0, byPlatform: {} });
  }
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    const k = bucketKey(dayKeyOf(s.start_time), bucket);
    const p = map.get(k) ?? { key: k, gross: 0, miles: 0, hours: 0, byPlatform: {} };
    const g = sessionGross(s);
    p.gross += g;
    p.miles += effectiveEngagedMiles(s);
    p.hours += num(s.total_engaged_seconds) / 3600;
    p.byPlatform[s.platform_id] = (p.byPlatform[s.platform_id] ?? 0) + g;
    map.set(k, p);
  }
  for (const a of adjustments) {
    const k = bucketKey(dayKeyOf(a.date), bucket);
    const p = map.get(k) ?? { key: k, gross: 0, miles: 0, hours: 0, byPlatform: {} };
    p.gross += a.amount;
    const pid = a.platformId ?? OTHER_PLATFORM;
    p.byPlatform[pid] = (p.byPlatform[pid] ?? 0) + a.amount;
    map.set(k, p);
  }
  return [...map.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
}

/** Pseudo platform id for adjustment entries with no platform. */
export const OTHER_PLATFORM = "__unassigned";

export interface PlatformTotal {
  id: string;
  name: string;
  /** Session pay: base + tips + per-session adjustment. */
  gross: number;
  /** Adjustment pay entries attributed to this platform. */
  adjustments: number;
  /** gross + adjustments */
  total: number;
  hours: number;
  miles: number;
  sessions: number;
  hourly: number | null;
}

export function totalsByPlatform(
  sessions: GigSession[],
  platforms: GigPlatform[],
  adjustments: AdjustmentRow[] = [],
): PlatformTotal[] {
  const byId = new Map(platforms.map((p) => [p.id, p]));
  const acc = new Map<string, PlatformTotal>();
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    const t = acc.get(s.platform_id) ?? {
      id: s.platform_id,
      name: byId.get(s.platform_id)?.name ?? "Unknown",
      gross: 0,
      adjustments: 0,
      total: 0,
      hours: 0,
      miles: 0,
      sessions: 0,
      hourly: null,
    };
    t.gross += sessionGross(s);
    t.hours += num(s.total_engaged_seconds) / 3600;
    t.miles += effectiveEngagedMiles(s);
    t.sessions += 1;
    acc.set(s.platform_id, t);
  }
  for (const a of adjustments) {
    const pid = a.platformId ?? OTHER_PLATFORM;
    const t = acc.get(pid) ?? {
      id: pid,
      name: pid === OTHER_PLATFORM ? "Unassigned" : byId.get(pid)?.name ?? "Unknown",
      gross: 0,
      adjustments: 0,
      total: 0,
      hours: 0,
      miles: 0,
      sessions: 0,
      hourly: null,
    };
    t.adjustments += a.amount;
    acc.set(pid, t);
  }
  return [...acc.values()]
    .map((t) => {
      const total = t.gross + t.adjustments;
      return { ...t, total, hourly: t.hours > 0 ? total / t.hours : null };
    })
    .sort((a, b) => b.total - a.total);
}
