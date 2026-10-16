/** Row types for the SoloSync iOS app tables (public schema). */

export type SessionStatus = "active" | "paused" | "completed";
export type VehicleType = "gasoline" | "diesel" | "hybrid" | "electric";
export type ExpenseType = "evCharging" | "gasoline" | "maintenance" | "insurance" | "other";
export type ScheduledGigStatus = "upcoming" | "started" | "cancelled" | "scheduled";

export const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: "evCharging", label: "EV Charging" },
  { value: "gasoline", label: "Gasoline" },
  { value: "maintenance", label: "Maintenance" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

export const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "electric", label: "Electric" },
  { value: "gasoline", label: "Gasoline" },
  { value: "hybrid", label: "Hybrid" },
  { value: "diesel", label: "Diesel" },
];

export const SCHEDULED_STATUSES: { value: ScheduledGigStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "started", label: "Started" },
  { value: "cancelled", label: "Cancelled" },
];

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  timezone: string | null;
  mileage_reimbursement_rate: number | null;
  energy_cost_per_kwh: number | null;
  default_hourly_target: number | null;
  zip_code: string | null;
  metro_area: string | null;
  pay_region: string | null;
}

export interface GigPlatform {
  id: string;
  user_id: string;
  name: string;
  icon_name: string | null;
  color_hex: string | null;
  default_hourly_target: number | null;
  is_active: boolean | null;
  local_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  vehicle_type: VehicleType;
  make: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
  mpg_combined: number | null;
  kwh_per_mile: number | null;
  battery_capacity_kwh: number | null;
  range_per_charge_miles: number | null;
  is_default: boolean | null;
  local_id: string | null;
  created_at: string;
}

export interface BreakPeriod {
  id: string;
  session_id: string;
  start_time: string;
  end_time: string | null;
  reason: string | null;
}

export interface GigSession {
  id: string;
  user_id: string;
  platform_id: string;
  vehicle_id: string | null;
  status: SessionStatus;
  start_time: string;
  end_time: string | null;
  total_engaged_seconds: number | null;
  total_miles: number | null;
  engaged_miles: number | null;
  tax_deductible_miles: number | null;
  earnings: number | null;
  tips: number | null;
  safety_admin_fee: number | null;
  adjustment_pay: number | null;
  energy_used: number | null;
  order_numbers: string[] | null;
  notes: string | null;
  device_id: string | null;
  local_id: string | null;
  created_at: string;
  updated_at: string;
  break_periods?: BreakPeriod[];
}

export interface Expense {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  expense_type: ExpenseType;
  amount: number;
  expense_date: string;
  notes: string | null;
  kwh_charged: number | null;
  price_per_kwh: number | null;
  gallons: number | null;
  price_per_gallon: number | null;
  location_name: string | null;
  local_id: string | null;
  created_at: string;
}

export interface ScheduledGig {
  id: string;
  user_id: string;
  platform_id: string | null;
  vehicle_id: string | null;
  status: ScheduledGigStatus;
  pickup_time: string;
  pickup_location: string;
  pickup_business: string | null;
  dropoff_time: string | null;
  dropoff_location: string | null;
  dropoff_business: string | null;
  expected_earnings: number | null;
  expected_base_pay: number | null;
  expected_tips: number | null;
  expected_fees: number | null;
  order_number: string | null;
  merchant: string | null;
  item_count: number | null;
  notes: string | null;
  started_session_id: string | null;
  local_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdjustmentPayEntry {
  id: string;
  user_id: string;
  platform_id: string | null;
  amount: number;
  entry_date: string;
  pay_period_start: string | null;
  notes: string | null;
  local_id: string | null;
  created_at: string;
}
