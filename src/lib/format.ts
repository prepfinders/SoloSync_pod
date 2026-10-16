export const fmtMoney = (n: number | null | undefined, digits = 2) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(n);

export const fmtNum = (n: number | null | undefined, digits = 1) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);

export const fmtHours = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const fmtDuration = (seconds: number | null | undefined) => {
  const s = Math.max(0, Math.round(seconds ?? 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

export const fmtDateTime = (iso: string | null | undefined, tz: string) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(iso))
    : "—";

export const fmtDate = (iso: string | null | undefined, tz: string) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso))
    : "—";

/** "YYYY-MM-DD" -> "Oct 15" */
export const fmtDayKey = (key: string, withYear = false) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(Date.UTC(y, m - 1, d)));
};
