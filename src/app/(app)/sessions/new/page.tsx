import { requireUser } from "@/lib/supabase/server";
import { getPlatforms, getProfile, getVehicles, tzOf } from "@/lib/queries";
import { createSession } from "@/app/actions/sessions";
import { SessionForm } from "@/components/forms/SessionForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NewSessionPage() {
  const { supabase, user } = await requireUser();
  const [profile, platforms, vehicles] = await Promise.all([
    getProfile(supabase, user.id),
    getPlatforms(supabase),
    getVehicles(supabase),
  ]);
  return (
    <>
      <PageHeader title="Log a session" description="Manually record a completed gig. It syncs to the iOS app on its next cloud sync." />
      <Card>
        <SessionForm action={createSession} platforms={platforms} vehicles={vehicles} tz={tzOf(profile)} />
      </Card>
    </>
  );
}
