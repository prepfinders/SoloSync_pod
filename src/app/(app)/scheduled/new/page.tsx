import { requireUser } from "@/lib/supabase/server";
import { getPlatforms, getProfile, getVehicles, tzOf } from "@/lib/queries";
import { createScheduledGig } from "@/app/actions/scheduled";
import { ScheduledGigForm } from "@/components/forms/ScheduledGigForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NewScheduledPage() {
  const { supabase, user } = await requireUser();
  const [profile, platforms, vehicles] = await Promise.all([getProfile(supabase, user.id), getPlatforms(supabase), getVehicles(supabase)]);
  return (
    <>
      <PageHeader title="Add a scheduled gig" />
      <Card>
        <ScheduledGigForm action={createScheduledGig} platforms={platforms} vehicles={vehicles} tz={tzOf(profile)} />
      </Card>
    </>
  );
}
