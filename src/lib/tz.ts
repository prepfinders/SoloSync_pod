/** Timezone helpers without a date library. All instants are JS Dates (UTC). */

export const DEFAULT_TZ = "America/Los_Angeles";

function partsIn(date: Date, tz: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour === 24 ? 0 : map.hour,
    minute: map.minute,
    second: map.second,
  };
}

/** Offset (ms) of `tz` from UTC at the given instant. */
function tzOffsetMs(date: Date, tz: string) {
  const p = partsIn(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** "YYYY-MM-DD" of the instant as seen in `tz`. */
export function dateKey(date: Date | string, tz: string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const p = partsIn(d, tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Converts wall-clock time in `tz` (e.g. "2026-10-15T08:30") to a UTC instant. */
export function zonedToUtc(local: string, tz: string): Date {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) throw new Error(`Invalid local datetime: ${local}`);
  const [, y, mo, d, h = "0", mi = "0", s = "0"] = m;
  const naive = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
  // Two passes handle DST transitions.
  let guess = naive - tzOffsetMs(new Date(naive), tz);
  guess = naive - tzOffsetMs(new Date(guess), tz);
  return new Date(guess);
}

/** Formats a UTC instant as "YYYY-MM-DDTHH:mm" in `tz` (for datetime-local inputs). */
export function toLocalInput(date: Date | string | null | undefined, tz: string) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const p = partsIn(d, tz);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Start of the calendar day (in tz) that contains `date`. */
export function startOfDay(date: Date, tz: string) {
  return zonedToUtc(dateKey(date, tz), tz);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}

/** Adds days to a "YYYY-MM-DD" key (calendar arithmetic, no tz needed). */
export function addDaysToKey(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d + days);
  return new Date(t).toISOString().slice(0, 10);
}

export function firstOfMonthKey(date: Date, tz: string) {
  return dateKey(date, tz).slice(0, 8) + "01";
}

export function firstOfYearKey(date: Date, tz: string) {
  return dateKey(date, tz).slice(0, 5) + "01-01";
}
