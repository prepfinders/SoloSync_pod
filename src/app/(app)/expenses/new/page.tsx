import { requireUser } from "@/lib/supabase/server";
import { getProfile, getVehicles, tzOf } from "@/lib/queries";
import { createExpense } from "@/app/actions/expenses";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NewExpensePage() {
  const { supabase, user } = await requireUser();
  const [profile, vehicles] = await Promise.all([getProfile(supabase, user.id), getVehicles(supabase)]);
  return (
    <>
      <PageHeader title="Add an expense" />
      <Card>
        <ExpenseForm action={createExpense} vehicles={vehicles} tz={tzOf(profile)} />
      </Card>
    </>
  );
}
