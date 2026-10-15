import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getPlatforms, getProfile, getScheduledGig, getVehicles, tzOf } from "@/lib/queries";
import { deleteScheduledGig, updateScheduledGig } from "@/app/actions/scheduled";
import { ScheduledGigForm } from "@/components/forms/ScheduledGigForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function EditScheduledPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const [profile, platforms, vehicles, gig] = await Promise.all([
    getProfile(supabase, user.id),
    getPlatforms(supabase),
    getVehicles(supabase),
    getScheduledGig(supabase, id),
  ]);
  if (!gig) notFound();
  return (
    <>
      <PageHeader title="Edit scheduled gig" action={<DeleteButton action={deleteScheduledGig.bind(null, id)} label="Delete gig" />} />
      <Card>
        <ScheduledGigForm action={updateScheduledGig.bind(null, id)} gig={gig} platforms={platforms} vehicles={vehicles} tz={tzOf(profile)} />
      </Card>
    </>
  );
}
