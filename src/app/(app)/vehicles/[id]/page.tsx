import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getVehicles } from "@/lib/queries";
import { updateVehicle } from "@/app/actions/catalog";
import { VehicleForm } from "@/components/forms/VehicleForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const vehicle = (await getVehicles(supabase)).find((v) => v.id === id);
  if (!vehicle) notFound();
  return (
    <>
      <PageHeader title="Edit vehicle" />
      <Card>
        <VehicleForm action={updateVehicle.bind(null, id)} vehicle={vehicle} />
      </Card>
    </>
  );
}
