import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getExpenses, getProfile, getVehicles, tzOf } from "@/lib/queries";
import { parseRange, type SearchParams } from "@/lib/range";
import { EXPENSE_TYPES } from "@/lib/types";
import { num } from "@/lib/metrics";
import { fmtDateTime, fmtMoney, fmtNum } from "@/lib/format";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  const tz = tzOf(profile);
  const range = parseRange(sp, tz, "ytd");
  const [expenses, vehicles] = await Promise.all([getExpenses(supabase, range.fromIso, range.toIso), getVehicles(supabase)]);
  const vmap = new Map(vehicles.map((v) => [v.id, v.name]));
  const label = (t: string) => EXPENSE_TYPES.find((x) => x.value === t)?.label ?? t;
  const total = expenses.reduce((a, e) => a + num(e.amount), 0);
  const byType = EXPENSE_TYPES.map((t) => ({
    ...t,
    total: expenses.filter((e) => e.expense_type === t.value).reduce((a, e) => a + num(e.amount), 0),
  })).filter((t) => t.total > 0);
  const kwh = expenses.reduce((a, e) => a + num(e.kwh_charged), 0);

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Charging, fuel, maintenance, insurance and other deductible costs."
        action={
          <Link href="/expenses/new" className="btn-primary">
            + Add expense
          </Link>
        }
      />
      <FilterBar basePath="/expenses" value={{ preset: range.preset, fromKey: range.fromKey, toKey: range.toKey }} platforms={[]} showPlatform={false} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total" value={fmtMoney(total)} hint={`${expenses.length} record${expenses.length === 1 ? "" : "s"}`} />
        {byType.slice(0, 2).map((t) => (
          <StatTile key={t.value} label={t.label} value={fmtMoney(t.total)} />
        ))}
        <StatTile label="kWh charged" value={fmtNum(kwh)} />
      </div>
      <Card>
        {expenses.length === 0 ? (
          <EmptyState>No expenses in this range.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Vehicle</th>
                  <th>Details</th>
                  <th className="text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{fmtDateTime(e.expense_date, tz)}</td>
                    <td>{label(e.expense_type)}</td>
                    <td className="text-ink-2">{e.vehicle_id ? vmap.get(e.vehicle_id) ?? "—" : "—"}</td>
                    <td className="max-w-[18rem] truncate text-ink-2">
                      {e.kwh_charged ? `${fmtNum(e.kwh_charged, 2)} kWh` : ""}
                      {e.gallons ? `${fmtNum(e.gallons, 2)} gal` : ""}
                      {e.location_name ? ` · ${e.location_name}` : ""}
                      {e.notes ? ` · ${e.notes}` : ""}
                    </td>
                    <td className="tnum text-right">{fmtMoney(e.amount)}</td>
                    <td className="text-right">
                      <Link href={`/expenses/${e.id}`} className="text-accent hover:underline">
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
