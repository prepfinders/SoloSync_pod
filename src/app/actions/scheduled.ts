"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./types";
import {
  FormError,
  WEB_DEVICE_ID,
  ctx,
  instantOrNull,
  intOrNull,
  newLocalId,
  numberOrNull,
  required,
  requiredInstant,
  run,
  text,
} from "./helpers";

const STATUSES = new Set(["upcoming", "started", "cancelled", "scheduled"]);

function parseGig(fd: FormData, tz: string) {
  const status = text(fd, "status") ?? "upcoming";
  if (!STATUSES.has(status)) throw new FormError("Invalid status.");
  const pickup_time = requiredInstant(fd, "pickup_time", "Pickup time", tz);
  const dropoff_time = instantOrNull(fd, "dropoff_time", "Dropoff time", tz);
  if (dropoff_time && dropoff_time < pickup_time) throw new FormError("Dropoff must be after pickup.");

  const base = numberOrNull(fd, "expected_base_pay", "Expected base pay");
  const tips = numberOrNull(fd, "expected_tips", "Expected tips");
  const fees = numberOrNull(fd, "expected_fees", "Expected fees");
  let expected = numberOrNull(fd, "expected_earnings", "Expected earnings");
  if (expected === null && (base !== null || tips !== null || fees !== null)) {
    expected = (base ?? 0) + (tips ?? 0) - (fees ?? 0);
  }

  return {
    platform_id: text(fd, "platform_id"),
    vehicle_id: text(fd, "vehicle_id"),
    status,
    pickup_time,
    pickup_location: required(fd, "pickup_location", "Pickup location"),
    pickup_business: text(fd, "pickup_business"),
    dropoff_time,
    dropoff_location: text(fd, "dropoff_location"),
    dropoff_business: text(fd, "dropoff_business"),
    order_number: text(fd, "order_number"),
    merchant: text(fd, "merchant"),
    item_count: intOrNull(fd, "item_count", "Item count"),
    expected_base_pay: base,
    expected_tips: tips,
    expected_fees: fees,
    expected_earnings: expected,
    notes: text(fd, "notes"),
    device_id: WEB_DEVICE_ID,
    updated_at: new Date().toISOString(),
  };
}

export async function createScheduledGig(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, user, tz } = await ctx();
    const row = parseGig(fd, tz);
    const { error } = await supabase
      .from("scheduled_gigs")
      .insert({ ...row, user_id: user.id, local_id: newLocalId() });
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/scheduled");
}

export async function updateScheduledGig(id: string, _p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, tz } = await ctx();
    const row = parseGig(fd, tz);
    const { error } = await supabase.from("scheduled_gigs").update(row).eq("id", id);
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/scheduled");
}

export async function deleteScheduledGig(id: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("scheduled_gigs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/scheduled");
}
