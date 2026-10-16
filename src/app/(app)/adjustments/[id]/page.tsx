import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getAdjustment, getPlatforms, getProfile, tzOf } from "@/lib/queries";
import { deleteAdjustment, updateAdjustment } from "@/app/actions/adjustments";
import { AdjustmentForm } from "@/components/forms/AdjustmentForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function EditAdjustmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const [profile, platforms, entry] = await Promise.all([getProfile(supabase, user.id), getPlatforms(supabase), getAdjustment(supabase, id)]);
  if (!entry) notFound();
  return (
    <>
      <PageHeader title="Edit adjustment pay" action={<DeleteButton action={deleteAdjustment.bind(null, id)} label="Delete entry" />} />
      <Card>
        <AdjustmentForm action={updateAdjustment.bind(null, id)} entry={entry} platforms={platforms} tz={tzOf(profile)} />
      </Card>
    </>
  );
}
