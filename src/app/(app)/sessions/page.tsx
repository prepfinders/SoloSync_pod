import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getPlatforms, getProfile, getSessionsPage, tzOf } from "@/lib/queries";
import { parseRange, rangeQuery, str, type SearchParams } from "@/lib/range";
import { num, sessionGross, sessionHourly } from "@/lib/metrics";
import { platformColors } from "@/lib/colors";
import { fmtDateTime, fmtDuration, fmtMoney, fmtNum } from "@/lib/format";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PlatformDot } from "@/components/ui/PlatformDot";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE_SIZE = 50;

export default async function SessionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  const tz = tzOf(profile);
  const range = parseRange(sp, tz, "30d");
  const platformId = str(sp, "platform");
  const page = Math.max(1, Number(str(sp, "page") ?? 1) || 1);

  const [platforms, { rows, total }] = await Promise.all([
    getPlatforms(supabase),
    getSessionsPage(supabase, { fromIso: range.fromIso, toIso: range.toIso, platformId, page, pageSize: PAGE_SIZE }),
  ]);
  const colors = platformColors(platforms);
  const platformMap = new Map(platforms.map((p) => [p.id, p]));

  return (
    <>
      <PageHeader
        title="Sessions"
        description="Every completed gig session synced from the app or logged here."
        action={
          <Link href="/sessions/new" className="btn-primary">
            + Log session
          </Link>
        }
      />
      <FilterBar
        basePath="/sessions"
        value={{ preset: range.preset, fromKey: range.fromKey, toKey: range.toKey, platformId }}
        platforms={platforms.map((p) => ({ id: p.id, name: p.name }))}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState>No sessions match this range.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>Platform</th>
                  <th>Orders</th>
                  <th className="text-right">Engaged</th>
                  <th className="text-right">Miles</th>
                  <th className="text-right">Base</th>
                  <th className="text-right">Tips</th>
                  <th className="text-right">Adj.</th>
                  <th className="text-right">$/hr</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap">{fmtDateTime(s.start_time, tz)}</td>
                    <td>
                      <PlatformDot color={colors[s.platform_id]} name={platformMap.get(s.platform_id)?.name ?? "Unknown"} />
                    </td>
                    <td className="max-w-[12rem] truncate text-ink-2">{(s.order_numbers ?? []).join(", ")}</td>
                    <td className="tnum text-right">{fmtDuration(num(s.total_engaged_seconds))}</td>
                    <td className="tnum text-right">{fmtNum(s.engaged_miles ?? num(s.total_miles))}</td>
                    <td className="tnum text-right">{fmtMoney(s.earnings)}</td>
                    <td className="tnum text-right">{fmtMoney(s.tips)}</td>
                    <td className="tnum text-right">{s.adjustment_pay ? fmtMoney(s.adjustment_pay) : "—"}</td>
                    <td className="tnum text-right">{fmtMoney(sessionHourly(s))}</td>
                    <td className="text-right">
                      <Link href={`/sessions/${s.id}`} className="text-accent hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-xs text-muted">
                  <td colSpan={10} className="pt-3">
                    Page total: {fmtMoney(rows.reduce((a, s) => a + sessionGross(s), 0))} gross ·{" "}
                    {fmtNum(rows.reduce((a, s) => a + (s.engaged_miles ?? num(s.total_miles)), 0))} mi
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          makeHref={(p) => `/sessions${rangeQuery(range, { platform: platformId, page: String(p) })}`}
        />
      </Card>
    </>
  );
}
