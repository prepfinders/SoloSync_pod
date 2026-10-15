import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getPlatforms } from "@/lib/queries";
import { platformColors } from "@/lib/colors";
import { fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PlatformDot } from "@/components/ui/PlatformDot";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function PlatformsPage() {
  const { supabase } = await requireUser();
  const platforms = await getPlatforms(supabase);
  const colors = platformColors(platforms);
  return (
    <>
      <PageHeader
        title="Platforms"
        description="Gig platforms you work for. Sessions and scheduled gigs are assigned to one of these."
        action={
          <Link href="/platforms/new" className="btn-primary">
            + Add platform
          </Link>
        }
      />
      <Card>
        {platforms.length === 0 ? (
          <EmptyState>No platforms yet.</EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>App color</th>
                <th className="text-right">Hourly target</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.id}>
                  <td>
                    <PlatformDot color={colors[p.id]} name={p.name} />
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-2 text-xs text-ink-2">
                      <span className="inline-block h-3 w-3 rounded-sm border border-line" style={{ background: p.color_hex ?? "#007AFF" }} />
                      {p.color_hex}
                    </span>
                  </td>
                  <td className="tnum text-right">{p.default_hourly_target ? fmtMoney(p.default_hourly_target, 0) : "—"}</td>
                  <td>{p.is_active === false ? <span className="chip">Inactive</span> : <span className="chip chip-active">Active</span>}</td>
                  <td className="text-right">
                    <Link href={`/platforms/${p.id}`} className="text-accent hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
