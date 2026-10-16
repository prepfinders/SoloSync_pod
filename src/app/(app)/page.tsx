import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import {
  getAdjustments,
  getExpenses,
  getPlatforms,
  getProfile,
  getScheduledGigs,
  getSessions,
  tzOf,
} from "@/lib/queries";
import { parseRange, rangeQuery, str, type SearchParams } from "@/lib/range";
import { bucketForSpan, computeTotals, groupByBucket, num, sessionGross, sessionHourly, totalsByPlatform } from "@/lib/metrics";
import { dateKey } from "@/lib/tz";
import { platformColors } from "@/lib/colors";
import { fmtDateTime, fmtDuration, fmtHours, fmtMoney, fmtNum } from "@/lib/format";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { EarningsChart } from "@/components/charts/EarningsChart";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { PlatformBarChart } from "@/components/charts/PlatformBarChart";
import { PlatformDot } from "@/components/ui/PlatformDot";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  const tz = tzOf(profile);
  const range = parseRange(sp, tz, "30d");
  const platformId = str(sp, "platform");

  const now = new Date();
  const [platforms, sessions, expenses, adjustments, upcoming] = await Promise.all([
    getPlatforms(supabase),
    getSessions(supabase, { fromIso: range.fromIso, toIso: range.toIso, platformId }),
    getExpenses(supabase, range.fromIso, range.toIso),
    getAdjustments(supabase, range.fromIso, range.toIso),
    getScheduledGigs(supabase, { status: "upcoming", fromIso: now.toISOString(), limit: 5 }),
  ]);

  const adjTotal = adjustments.reduce((a, r) => a + num(r.amount), 0);
  const totals = computeTotals(sessions, expenses, adjTotal, profile);
  const bucket = bucketForSpan(range.days);
  const series = groupByBucket(sessions, (iso) => dateKey(iso, tz), range.fromKey, range.toKey, bucket);
  const colors = platformColors(platforms);
  const byPlatform = totalsByPlatform(sessions, platforms);
  const platformMap = new Map(platforms.map((p) => [p.id, p]));
  const target = num(profile?.default_hourly_target) || 25;

  const seriesDefs = byPlatform.map((p) => ({ id: p.id, name: p.name, color: colors[p.id] ?? "var(--s-other)" }));
  const recent = sessions.slice(0, 8);
  const q = rangeQuery(range, { platform: platformId });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-2">
            {range.label} · {totals.sessions} completed session{totals.sessions === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/sessions/new" className="btn-primary">
            + Log session
          </Link>
          <Link href="/expenses/new" className="btn-ghost">
            + Expense
          </Link>
        </div>
      </div>

      <FilterBar
        value={{ preset: range.preset, fromKey: range.fromKey, toKey: range.toKey, platformId }}
        platforms={platforms.map((p) => ({ id: p.id, name: p.name }))}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Gross earnings" value={fmtMoney(totals.gross)} hint={`${fmtMoney(totals.earnings)} base + ${fmtMoney(totals.tips)} tips${totals.sessionAdjustments ? ` + ${fmtMoney(totals.sessionAdjustments)} adj.` : ""}`} />
        <StatTile label="Engaged time" value={fmtHours(totals.engagedHours)} hint={totals.breakHours > 0 ? `${fmtHours(totals.breakHours)} on break` : undefined} />
        <StatTile label="Engaged miles" value={fmtNum(totals.miles)} hint={`${fmtNum(totals.taxDeductibleMiles)} tax-deductible`} />
        <StatTile
          label="Avg per hour"
          value={fmtMoney(totals.avgHourly)}
          hint={`target ${fmtMoney(target, 0)}/hr`}
          tone={totals.avgHourly === null ? "default" : totals.avgHourly >= target ? "good" : "bad"}
        />
        <StatTile label="Avg per mile" value={fmtMoney(totals.avgPerMile)} />
        <StatTile label="Sessions" value={String(totals.sessions)} hint={totals.sessions ? `${fmtNum(totals.miles / totals.sessions)} mi avg` : undefined} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="IRS deduction" value={fmtMoney(totals.irsDeduction)} hint="$0.725 / deductible mile" />
        <StatTile label="Expenses" value={fmtMoney(totals.expenses)} hint={`${expenses.length} record${expenses.length === 1 ? "" : "s"}`} />
        <StatTile label="Safety & admin fees" value={fmtMoney(totals.safetyFees)} />
        <StatTile label="Taxable income" value={fmtMoney(totals.taxableIncome)} hint="gross − deduction − expenses − fees" tone={totals.taxableIncome < 0 ? "bad" : "default"} />
        <StatTile label="Adjustment pay" value={fmtMoney(totals.adjustmentPay)} hint={`${adjustments.length} entr${adjustments.length === 1 ? "y" : "ies"}`} />
        <StatTile label="Energy used" value={`${fmtNum(totals.energyKwh)} kWh`} hint={`≈ ${fmtMoney(totals.energyCost)} · ${fmtMoney(totals.mileageReimbursement)} mileage reimb.`} />
      </div>

      <div className="mt-5 grid gap-4">
        <Card title="Earnings" subtitle={`Gross (base + tips + adjustment pay) per ${bucket}, stacked by platform`}>
          <EarningsChart data={series} series={seriesDefs} bucket={bucket} />
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Engaged miles" subtitle={`per ${bucket}`}>
            <SimpleBarChart data={series.map((s) => ({ key: s.key, value: s.miles }))} name="Miles" bucket={bucket} unit="miles" />
          </Card>
          <Card title="Engaged hours" subtitle={`per ${bucket}`}>
            <SimpleBarChart data={series.map((s) => ({ key: s.key, value: s.hours }))} name="Hours" bucket={bucket} unit="hours" />
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Earnings by platform">
            <PlatformBarChart data={byPlatform.map((p) => ({ ...p, color: colors[p.id] ?? "var(--s-other)" }))} />
          </Card>
          <Card title="Platform breakdown">
            {byPlatform.length === 0 ? (
              <EmptyState>No sessions in this range.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th className="text-right">Sessions</th>
                      <th className="text-right">Hours</th>
                      <th className="text-right">Miles</th>
                      <th className="text-right">Gross</th>
                      <th className="text-right">$/hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPlatform.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <PlatformDot color={colors[p.id]} name={p.name} />
                        </td>
                        <td className="tnum text-right">{p.sessions}</td>
                        <td className="tnum text-right">{fmtNum(p.hours)}</td>
                        <td className="tnum text-right">{fmtNum(p.miles)}</td>
                        <td className="tnum text-right">{fmtMoney(p.gross)}</td>
                        <td className="tnum text-right">{fmtMoney(p.hourly)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <Card
            className="md:col-span-3"
            title="Recent sessions"
            action={
              <Link href={`/sessions${q}`} className="text-xs font-medium text-accent hover:underline">
                View all
              </Link>
            }
          >
            {recent.length === 0 ? (
              <EmptyState>
                No sessions in this range.{" "}
                <Link href="/sessions/new" className="text-accent hover:underline">
                  Log one
                </Link>
                .
              </EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Start</th>
                      <th>Platform</th>
                      <th className="text-right">Engaged</th>
                      <th className="text-right">Miles</th>
                      <th className="text-right">Gross</th>
                      <th className="text-right">$/hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((s) => {
                      const p = platformMap.get(s.platform_id);
                      return (
                        <tr key={s.id}>
                          <td>
                            <Link href={`/sessions/${s.id}`} className="text-accent hover:underline">
                              {fmtDateTime(s.start_time, tz)}
                            </Link>
                          </td>
                          <td>
                            <PlatformDot color={colors[s.platform_id]} name={p?.name ?? "Unknown"} />
                          </td>
                          <td className="tnum text-right">{fmtDuration(num(s.total_engaged_seconds))}</td>
                          <td className="tnum text-right">{fmtNum(s.engaged_miles ?? num(s.total_miles))}</td>
                          <td className="tnum text-right">{fmtMoney(sessionGross(s))}</td>
                          <td className="tnum text-right">{fmtMoney(sessionHourly(s))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <Card
            className="md:col-span-2"
            title="Upcoming gigs"
            action={
              <Link href="/scheduled" className="text-xs font-medium text-accent hover:underline">
                Manage
              </Link>
            }
          >
            {upcoming.length === 0 ? (
              <EmptyState>
                Nothing scheduled.{" "}
                <Link href="/scheduled/new" className="text-accent hover:underline">
                  Add a gig
                </Link>
                .
              </EmptyState>
            ) : (
              <ul className="divide-y divide-grid">
                {upcoming.map((g) => (
                  <li key={g.id} className="py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/scheduled/${g.id}`} className="font-medium text-ink hover:underline">
                        {fmtDateTime(g.pickup_time, tz)}
                      </Link>
                      <span className="tnum text-ink-2">{fmtMoney(g.expected_earnings)}</span>
                    </div>
                    <div className="truncate text-xs text-ink-2">
                      {g.platform_id && platformMap.get(g.platform_id)?.name ? `${platformMap.get(g.platform_id)!.name} · ` : ""}
                      {g.pickup_business || g.merchant || g.pickup_location}
                      {g.dropoff_location ? ` → ${g.dropoff_business || g.dropoff_location}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
