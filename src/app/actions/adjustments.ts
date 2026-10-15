"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./types";
import { FormError, WEB_DEVICE_ID, ctx, newLocalId, numberOrNull, requiredInstant, run, text } from "./helpers";

function parseAdjustment(fd: FormData, tz: string) {
  const amount = numberOrNull(fd, "amount", "Amount");
  if (amount === null) throw new FormError("Amount is required.");
  const period = text(fd, "pay_period_start");
  if (period && !/^\d{4}-\d{2}-\d{2}$/.test(period)) throw new FormError("Pay period start must be a date.");
  return {
    amount,
    entry_date: requiredInstant(fd, "entry_date", "Date", tz),
    pay_period_start: period,
    platform_id: text(fd, "platform_id"),
    notes: text(fd, "notes"),
    device_id: WEB_DEVICE_ID,
  };
}

export async function createAdjustment(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, user, tz } = await ctx();
    const { error } = await supabase
      .from("adjustment_pay_entries")
      .insert({ ...parseAdjustment(fd, tz), user_id: user.id, local_id: newLocalId() });
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/adjustments");
}

export async function updateAdjustment(id: string, _p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, tz } = await ctx();
    const { error } = await supabase.from("adjustment_pay_entries").update(parseAdjustment(fd, tz)).eq("id", id);
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/adjustments");
}

export async function deleteAdjustment(id: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("adjustment_pay_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/adjustments");
}
