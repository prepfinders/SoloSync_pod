import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getVehicles } from "@/lib/queries";
import { VEHICLE_TYPES } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function VehiclesPage() {
  const { supabase } = await requireUser();
  const vehicles = await getVehicles(supabase);
  const typeLabel = (t: string) => VEHICLE_TYPES.find((x) => x.value === t)?.label ?? t;
  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Vehicles used for mileage and energy tracking."
        action={
          <Link href="/vehicles/new" className="btn-primary">
            + Add vehicle
          </Link>
        }
      />
      <Card>
        {vehicles.length === 0 ? (
          <EmptyState>No vehicles yet.</EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Make / model</th>
                <th className="text-right">Efficiency</th>
                <th>Default</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="font-medium">{v.name}</td>
                  <td>{typeLabel(v.vehicle_type)}</td>
                  <td className="text-ink-2">{[v.year, v.make, v.model].filter(Boolean).join(" ") || "—"}</td>
                  <td className="tnum text-right text-ink-2">
                    {v.kwh_per_mile ? `${v.kwh_per_mile} kWh/mi` : v.mpg_combined ? `${v.mpg_combined} mpg` : "—"}
                  </td>
                  <td>{v.is_default ? <span className="chip chip-active">Default</span> : ""}</td>
                  <td className="text-right">
                    <Link href={`/vehicles/${v.id}`} className="text-accent hover:underline">
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
