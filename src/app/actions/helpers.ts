import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getProfile, tzOf } from "@/lib/queries";
import { zonedToUtc } from "@/lib/tz";

/** Device id stamped on rows created from the web so the iOS app treats them as remote. */
export const WEB_DEVICE_ID = "web-dashboard";

export class FormError extends Error {}

export async function ctx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new FormError("You are signed out. Please sign in again.");
  const profile = await getProfile(supabase, user.id);
  return { supabase, user, profile, tz: tzOf(profile) };
}

export const text = (fd: FormData, key: string) => {
  const v = fd.get(key);
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};

export const required = (fd: FormData, key: string, label: string) => {
  const v = text(fd, key);
  if (v === null) throw new FormError(`${label} is required.`);
  return v;
};

export const numberOrNull = (fd: FormData, key: string, label: string) => {
  const v = text(fd, key);
  if (v === null) return null;
  const n = Number(v.replace(/[$,]/g, ""));
  if (!Number.isFinite(n)) throw new FormError(`${label} must be a number.`);
  return n;
};

export const intOrNull = (fd: FormData, key: string, label: string) => {
  const n = numberOrNull(fd, key, label);
  return n === null ? null : Math.round(n);
};

export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

/** datetime-local / date string in the user's timezone -> ISO instant. */
export const instantOrNull = (fd: FormData, key: string, label: string, tz: string) => {
  const v = text(fd, key);
  if (v === null) return null;
  try {
    return zonedToUtc(v, tz).toISOString();
  } catch {
    throw new FormError(`${label} is not a valid date/time.`);
  }
};

export const requiredInstant = (fd: FormData, key: string, label: string, tz: string) => {
  const v = instantOrNull(fd, key, label, tz);
  if (!v) throw new FormError(`${label} is required.`);
  return v;
};

export const newLocalId = () => randomUUID();

/** Runs an action body, converting thrown form errors into state. */
export async function run<T>(fn: () => Promise<T>): Promise<{ error?: string } | T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof FormError) return { error: e.message };
    const msg = e instanceof Error ? e.message : String(e);
    // Next.js redirect() throws; let it propagate.
    if (msg.startsWith("NEXT_REDIRECT")) throw e;
    return { error: msg };
  }
}
