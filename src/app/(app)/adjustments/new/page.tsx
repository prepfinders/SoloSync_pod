import { requireUser } from "@/lib/supabase/server";
import { getPlatforms, getProfile, tzOf } from "@/lib/queries";
import { createAdjustment } from "@/app/actions/adjustments";
import { AdjustmentForm } from "@/components/forms/AdjustmentForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NewAdjustmentPage() {
  const { supabase, user } = await requireUser();
  const [profile, platforms] = await Promise.all([getProfile(supabase, user.id), getPlatforms(supabase)]);
  return (
    <>
      <PageHeader title="Add adjustment pay" />
      <Card>
        <AdjustmentForm action={createAdjustment} platforms={platforms} tz={tzOf(profile)} />
      </Card>
    </>
  );
}
