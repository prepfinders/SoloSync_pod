import { requireUser } from "@/lib/supabase/server";
import { createVehicle } from "@/app/actions/catalog";
import { VehicleForm } from "@/components/forms/VehicleForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NewVehiclePage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Add a vehicle" />
      <Card>
        <VehicleForm action={createVehicle} />
      </Card>
    </>
  );
}
