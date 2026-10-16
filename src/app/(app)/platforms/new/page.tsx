import { requireUser } from "@/lib/supabase/server";
import { createPlatform } from "@/app/actions/catalog";
import { PlatformForm } from "@/components/forms/PlatformForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NewPlatformPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Add a platform" />
      <Card>
        <PlatformForm action={createPlatform} />
      </Card>
    </>
  );
}
