"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./types";
import { FormError, WEB_DEVICE_ID, bool, ctx, intOrNull, newLocalId, numberOrNull, required, run, text } from "./helpers";

// ---------- Platforms ----------

function parsePlatform(fd: FormData) {
  const color = text(fd, "color_hex") ?? "#007AFF";
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new FormError("Color must be a hex value like #007AFF.");
  return {
    name: required(fd, "name", "Name"),
    color_hex: color.toUpperCase(),
    icon_name: text(fd, "icon_name") ?? "briefcase.fill",
    default_hourly_target: numberOrNull(fd, "default_hourly_target", "Hourly target"),
    is_active: bool(fd, "is_active"),
    device_id: WEB_DEVICE_ID,
    updated_at: new Date().toISOString(),
  };
}

export async function createPlatform(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, user } = await ctx();
    const { error } = await supabase
      .from("gig_platforms")
      .insert({ ...parsePlatform(fd), user_id: user.id, local_id: newLocalId() });
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/platforms");
}

export async function updatePlatform(id: string, _p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase } = await ctx();
    const { error } = await supabase.from("gig_platforms").update(parsePlatform(fd)).eq("id", id);
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/platforms");
}

// ---------- Vehicles ----------

const VTYPES = new Set(["gasoline", "diesel", "hybrid", "electric"]);

function parseVehicle(fd: FormData) {
  const vehicle_type = text(fd, "vehicle_type") ?? "electric";
  if (!VTYPES.has(vehicle_type)) throw new FormError("Invalid vehicle type.");
  return {
    name: required(fd, "name", "Name"),
    vehicle_type,
    make: text(fd, "make"),
    model: text(fd, "model"),
    year: intOrNull(fd, "year", "Year"),
    license_plate: text(fd, "license_plate"),
    mpg_combined: numberOrNull(fd, "mpg_combined", "MPG"),
    kwh_per_mile: numberOrNull(fd, "kwh_per_mile", "kWh per mile"),
    battery_capacity_kwh: numberOrNull(fd, "battery_capacity_kwh", "Battery capacity"),
    range_per_charge_miles: numberOrNull(fd, "range_per_charge_miles", "Range"),
    is_default: bool(fd, "is_default"),
    device_id: WEB_DEVICE_ID,
    updated_at: new Date().toISOString(),
  };
}

export async function createVehicle(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, user } = await ctx();
    const { error } = await supabase
      .from("vehicles")
      .insert({ ...parseVehicle(fd), user_id: user.id, local_id: newLocalId() });
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/vehicles");
}

export async function updateVehicle(id: string, _p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase } = await ctx();
    const { error } = await supabase.from("vehicles").update(parseVehicle(fd)).eq("id", id);
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  redirect("/vehicles");
}

// ---------- Profile / settings ----------

export async function updateProfile(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await run(async () => {
    const { supabase, user } = await ctx();
    const timezone = text(fd, "timezone") ?? "America/Los_Angeles";
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    } catch {
      throw new FormError("Unknown timezone. Use an IANA name like America/Los_Angeles.");
    }
    const row = {
      id: user.id,
      email: user.email,
      full_name: text(fd, "full_name"),
      timezone,
      mileage_reimbursement_rate: numberOrNull(fd, "mileage_reimbursement_rate", "Mileage rate"),
      energy_cost_per_kwh: numberOrNull(fd, "energy_cost_per_kwh", "Energy cost"),
      default_hourly_target: numberOrNull(fd, "default_hourly_target", "Hourly target"),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("user_profiles").upsert(row, { onConflict: "id" });
    if (error) throw new FormError(error.message);
    return { ok: true };
  });
  if ("error" in res) return res;
  revalidatePath("/", "layout");
  return { ok: true };
}
