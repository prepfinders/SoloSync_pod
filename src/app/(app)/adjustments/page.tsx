import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getAdjustments, getPlatforms, getProfile, tzOf } from "@/lib/queries";
import { parseRange, type SearchParams } from "@/lib/range";
import { num } from "@/lib/metrics";
import { findPlatform, platformColors } from "@/lib/colors";
import { fmtDate, fmtDateTime, fmtMoney } from "@/lib/format";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { PlatformDot } from "@/components/ui/PlatformDot";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdjustmentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  const tz = tzOf(profile);
  const range = parseRange(sp, tz, "ytd");
  const [entries, platforms] = await Promise.all([getAdjustments(supabase, range.fromIso, range.toIso), getPlatforms(supabase)]);
  const colors = platformColors(platforms);
  const total = entries.reduce((a, e) => a + num(e.amount), 0);

  return (
    <>
      <PageHeader
        title="Adjustment pay"
        description="Pay-period adjustments such as guaranteed-earnings top-ups and bonuses that are not tied to one session."
        action={
          <Link href="/adjustments/new" className="btn-primary">
            + Add entry
          </Link>
        }
      />
      <FilterBar basePath="/adjustments" value={{ preset: range.preset, fromKey: range.fromKey, toKey: range.toKey }} platforms={[]} showPlatform={false} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total adjustments" value={fmtMoney(total)} hint={`${entries.length} entr${entries.length === 1 ? "y" : "ies"}`} />
      </div>
      <Card>
        {entries.length === 0 ? (
          <EmptyState>No adjustment pay in this range.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Paid on</th>
                  <th>Pay period</th>
                  <th>Platform</th>
                  <th>Notes</th>
                  <th className="text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{fmtDateTime(e.entry_date, tz)}</td>
                    <td className="text-ink-2">{e.pay_period_start ? fmtDate(`${e.pay_period_start}T12:00:00Z`, "UTC") : "—"}</td>
                    <td>{(() => { const p = findPlatform(platforms, e.platform_id); return p ? <PlatformDot color={colors[p.id]} name={p.name} /> : "—"; })()}</td>
                    <td className="max-w-[18rem] truncate text-ink-2">{e.notes ?? ""}</td>
                    <td className={`tnum text-right ${num(e.amount) < 0 ? "text-bad" : ""}`}>{fmtMoney(e.amount)}</td>
                    <td className="text-right">
                      <Link href={`/adjustments/${e.id}`} className="text-accent hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
