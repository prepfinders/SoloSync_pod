import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getExpense, getProfile, getVehicles, tzOf } from "@/lib/queries";
import { deleteExpense, updateExpense } from "@/app/actions/expenses";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const [profile, vehicles, expense] = await Promise.all([getProfile(supabase, user.id), getVehicles(supabase), getExpense(supabase, id)]);
  if (!expense) notFound();
  return (
    <>
      <PageHeader title="Edit expense" action={<DeleteButton action={deleteExpense.bind(null, id)} label="Delete expense" />} />
      <Card>
        <ExpenseForm action={updateExpense.bind(null, id)} expense={expense} vehicles={vehicles} tz={tzOf(profile)} />
      </Card>
    </>
  );
}
