"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./types";
import { FormError, WEB_DEVICE_ID, ctx, newLocalId, numberOrNull, requiredInstant, run, text } from "./helpers";

const TYPES = new Set(["evCharging", "gasoline", "maintenance", "insurance", "other"]);

function parseExpense(fd: FormData, tz: string) {
  const expense_type = text(fd, "expense_type") ?? "other";
  if (!TYPES.has(expense_type)) throw new FormError("Invalid expense type.");
  const amount = numberOrNull(fd, "amount", "Amount");
  if (amount === null || amount < 0) throw new FormError("Amount is required and must be 0 or more.");
  return {
    expense_type,
    amount,
    expense_date: requiredInstant(fd, "expense_date", "Date", tz),
    vehicle_id: text(fd, "vehicle_id"),
    notes: text(fd, "notes"),
    kwh_charged: numberOrNull(fd, "kwh_charged", "kWh charged"),
    price_per_kwh: numberOrNull(fd, "price_per_kwh", "Price per kWh"),
    gallons: numberOrNull(fd, "gallons", "Gallons"),
    price_per_gallon: numberOrNull(fd, "price_per_gallon", "Price per gallon"),
    location_name: text(fd, "location_name"),
    device_id: WEB_DEVICE_ID,
    updated_at: new Date().toISOString(),
  };
}

export async function createExpense(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, user, tz } = await ctx();
    const { error } = await supabase
      .from("expenses")
      .insert({ ...parseExpense(fd, tz), user_id: user.id, local_id: newLocalId() });
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/expenses");
}

export async function updateExpense(id: string, _p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, tz } = await ctx();
    const { error } = await supabase.from("expenses").update(parseExpense(fd, tz)).eq("id", id);
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/expenses");
}

export async function deleteExpense(id: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/expenses");
}
