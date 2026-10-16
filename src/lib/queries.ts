import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdjustmentPayEntry,
  Expense,
  GigPlatform,
  GigSession,
  ScheduledGig,
  UserProfile,
  Vehicle,
} from "./types";
import { DEFAULT_TZ } from "./tz";

type DB = SupabaseClient;

function fail(ctx: string, error: { message: string } | null) {
  if (error) throw new Error(`${ctx}: ${error.message}`);
}

export async function getProfile(db: DB, userId: string): Promise<UserProfile | null> {
  const { data, error } = await db.from("user_profiles").select("*").eq("id", userId).maybeSingle();
  fail("profile", error);
  return data as UserProfile | null;
}

export function tzOf(profile: UserProfile | null) {
  return profile?.timezone || DEFAULT_TZ;
}

export async function getPlatforms(db: DB): Promise<GigPlatform[]> {
  const { data, error } = await db.from("gig_platforms").select("*").order("created_at");
  fail("platforms", error);
  return (data ?? []) as GigPlatform[];
}

export async function getVehicles(db: DB): Promise<Vehicle[]> {
  const { data, error } = await db.from("vehicles").select("*").order("created_at");
  fail("vehicles", error);
  return (data ?? []) as Vehicle[];
}

export interface SessionFilter {
  fromIso: string;
  toIso: string;
  platformId?: string;
  page?: number;
  pageSize?: number;
}

export async function getSessions(db: DB, f: SessionFilter): Promise<GigSession[]> {
  let q = db
    .from("gig_sessions")
    .select("*, break_periods(*)")
    .gte("start_time", f.fromIso)
    .lt("start_time", f.toIso)
    .order("start_time", { ascending: false })
    .limit(5000);
  if (f.platformId) q = q.eq("platform_id", f.platformId);
  const { data, error } = await q;
  fail("sessions", error);
  return (data ?? []) as GigSession[];
}

export async function getSessionsPage(
  db: DB,
  f: SessionFilter,
): Promise<{ rows: GigSession[]; total: number }> {
  const page = Math.max(1, f.page ?? 1);
  const size = f.pageSize ?? 50;
  let q = db
    .from("gig_sessions")
    .select("*, break_periods(*)", { count: "exact" })
    .gte("start_time", f.fromIso)
    .lt("start_time", f.toIso)
    .order("start_time", { ascending: false })
    .range((page - 1) * size, page * size - 1);
  if (f.platformId) q = q.eq("platform_id", f.platformId);
  const { data, error, count } = await q;
  fail("sessions", error);
  return { rows: (data ?? []) as GigSession[], total: count ?? 0 };
}

export async function getSession(db: DB, id: string): Promise<GigSession | null> {
  const { data, error } = await db
    .from("gig_sessions")
    .select("*, break_periods(*)")
    .eq("id", id)
    .maybeSingle();
  fail("session", error);
  return data as GigSession | null;
}

export async function getExpenses(db: DB, fromIso: string, toIso: string): Promise<Expense[]> {
  const { data, error } = await db
    .from("expenses")
    .select("*")
    .gte("expense_date", fromIso)
    .lt("expense_date", toIso)
    .order("expense_date", { ascending: false });
  fail("expenses", error);
  return (data ?? []) as Expense[];
}

export async function getExpense(db: DB, id: string): Promise<Expense | null> {
  const { data, error } = await db.from("expenses").select("*").eq("id", id).maybeSingle();
  fail("expense", error);
  return data as Expense | null;
}

export async function getAdjustments(db: DB, fromIso: string, toIso: string): Promise<AdjustmentPayEntry[]> {
  const { data, error } = await db
    .from("adjustment_pay_entries")
    .select("*")
    .gte("entry_date", fromIso)
    .lt("entry_date", toIso)
    .order("entry_date", { ascending: false });
  fail("adjustments", error);
  return (data ?? []) as AdjustmentPayEntry[];
}

export async function getAdjustment(db: DB, id: string): Promise<AdjustmentPayEntry | null> {
  const { data, error } = await db.from("adjustment_pay_entries").select("*").eq("id", id).maybeSingle();
  fail("adjustment", error);
  return data as AdjustmentPayEntry | null;
}

export async function getScheduledGigs(
  db: DB,
  opts: { status?: string; fromIso?: string; toIso?: string; limit?: number } = {},
): Promise<ScheduledGig[]> {
  let q = db.from("scheduled_gigs").select("*").is("archived_at", null).order("pickup_time", { ascending: true });
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.fromIso) q = q.gte("pickup_time", opts.fromIso);
  if (opts.toIso) q = q.lt("pickup_time", opts.toIso);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  fail("scheduled gigs", error);
  return (data ?? []) as ScheduledGig[];
}

export async function getScheduledGig(db: DB, id: string): Promise<ScheduledGig | null> {
  const { data, error } = await db.from("scheduled_gigs").select("*").eq("id", id).maybeSingle();
  fail("scheduled gig", error);
  return data as ScheduledGig | null;
}
