"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./types";
import {
  FormError,
  WEB_DEVICE_ID,
  ctx,
  instantOrNull,
  newLocalId,
  numberOrNull,
  required,
  requiredInstant,
  run,
  text,
} from "./helpers";

function parseSession(fd: FormData, tz: string) {
  const platform_id = required(fd, "platform_id", "Platform");
  const start_time = requiredInstant(fd, "start_time", "Start time", tz);
  const end_time = instantOrNull(fd, "end_time", "End time", tz);
  if (end_time && end_time < start_time) throw new FormError("End time must be after start time.");

  const h = numberOrNull(fd, "engaged_hours", "Engaged hours") ?? 0;
  const m = numberOrNull(fd, "engaged_minutes", "Engaged minutes") ?? 0;
  let total_engaged_seconds = Math.round(h * 3600 + m * 60);
  if (total_engaged_seconds <= 0 && end_time) {
    total_engaged_seconds = Math.round((new Date(end_time).getTime() - new Date(start_time).getTime()) / 1000);
  }
  if (total_engaged_seconds < 0) throw new FormError("Engaged time cannot be negative.");

  const total_miles = numberOrNull(fd, "total_miles", "Total miles") ?? 0;
  const engaged_miles = numberOrNull(fd, "engaged_miles", "Engaged miles");
  const tax_deductible_miles = numberOrNull(fd, "tax_deductible_miles", "Tax-deductible miles") ?? engaged_miles ?? total_miles;
  const orders = (text(fd, "order_numbers") ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    platform_id,
    vehicle_id: text(fd, "vehicle_id"),
    start_time,
    end_time,
    total_engaged_seconds,
    total_miles,
    engaged_miles,
    tax_deductible_miles,
    earnings: numberOrNull(fd, "earnings", "Earnings"),
    tips: numberOrNull(fd, "tips", "Tips"),
    adjustment_pay: numberOrNull(fd, "adjustment_pay", "Adjustment pay"),
    safety_admin_fee: numberOrNull(fd, "safety_admin_fee", "Safety & admin fee"),
    energy_used: numberOrNull(fd, "energy_used", "Energy used"),
    order_numbers: orders.length ? orders : null,
    notes: text(fd, "notes"),
    device_id: WEB_DEVICE_ID,
    updated_at: new Date().toISOString(),
  };
}

export async function createSession(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, user, tz } = await ctx();
    const row = parseSession(fd, tz);
    const { error } = await supabase.from("gig_sessions").insert({
      ...row,
      user_id: user.id,
      local_id: newLocalId(),
      status: "completed",
    });
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/sessions");
}

export async function updateSession(id: string, _p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, tz } = await ctx();
    const row = parseSession(fd, tz);
    const { error } = await supabase.from("gig_sessions").update(row).eq("id", id);
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/sessions");
}

export async function deleteSession(id: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("gig_sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/sessions");
}
