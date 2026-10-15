import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getPlatforms } from "@/lib/queries";
import { updatePlatform } from "@/app/actions/catalog";
import { PlatformForm } from "@/components/forms/PlatformForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function EditPlatformPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const platform = (await getPlatforms(supabase)).find((p) => p.id === id);
  if (!platform) notFound();
  return (
    <>
      <PageHeader title="Edit platform" description="Platforms with sessions cannot be deleted; mark them inactive instead." />
      <Card>
        <PlatformForm action={updatePlatform.bind(null, id)} platform={platform} />
      </Card>
    </>
  );
}
