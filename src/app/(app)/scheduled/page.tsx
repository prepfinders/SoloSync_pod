import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getPlatforms, getProfile, getScheduledGigs, tzOf } from "@/lib/queries";
import { str, type SearchParams } from "@/lib/range";
import { startOfDay } from "@/lib/tz";
import { platformColors } from "@/lib/colors";
import { fmtDateTime, fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PlatformDot } from "@/components/ui/PlatformDot";
import { EmptyState } from "@/components/ui/EmptyState";

const VIEWS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past upcoming" },
  { value: "started", label: "Started" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function ScheduledPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const view = str(sp, "view") ?? "upcoming";
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  const tz = tzOf(profile);
  const todayStart = startOfDay(new Date(), tz).toISOString();

  const [platforms, gigs] = await Promise.all([
    getPlatforms(supabase),
    view === "upcoming"
      ? getScheduledGigs(supabase, { status: "upcoming", fromIso: todayStart })
      : view === "past"
        ? getScheduledGigs(supabase, { status: "upcoming", toIso: todayStart, limit: 200 })
        : getScheduledGigs(supabase, { status: view, limit: 200 }),
  ]);
  const colors = platformColors(platforms);
  const platformMap = new Map(platforms.map((p) => [p.id, p]));
  const rows = view === "upcoming" ? gigs : [...gigs].reverse();
  const expected = rows.reduce((a, g) => a + Number(g.expected_earnings ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Scheduled gigs"
        description="Pickups and deliveries planned ahead. These show up in the app's Upcoming Gigs card."
        action={
          <Link href="/scheduled/new" className="btn-primary">
            + Add gig
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-1">
        {VIEWS.map((v) => (
          <Link key={v.value} href={`/scheduled?view=${v.value}`} className={`chip ${view === v.value ? "chip-active" : "hover:bg-surface-2"}`}>
            {v.label}
          </Link>
        ))}
      </div>
      <Card subtitle={rows.length ? `${rows.length} gig${rows.length === 1 ? "" : "s"} · ${fmtMoney(expected)} expected` : undefined}>
        {rows.length === 0 ? (
          <EmptyState>No gigs in this view.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Pickup</th>
                  <th>Platform</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Order</th>
                  <th className="text-right">Expected</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr key={g.id}>
                    <td className="whitespace-nowrap">{fmtDateTime(g.pickup_time, tz)}</td>
                    <td>
                      {g.platform_id ? (
                        <PlatformDot color={colors[g.platform_id]} name={platformMap.get(g.platform_id)?.name ?? "Unknown"} />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="max-w-[14rem] truncate">{g.pickup_business || g.merchant || g.pickup_location}</td>
                    <td className="max-w-[14rem] truncate">{g.dropoff_business || g.dropoff_location || <span className="text-muted">—</span>}</td>
                    <td className="text-ink-2">{g.order_number ?? ""}</td>
                    <td className="tnum text-right">{fmtMoney(g.expected_earnings)}</td>
                    <td className="text-right">
                      <Link href={`/scheduled/${g.id}`} className="text-accent hover:underline">
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
