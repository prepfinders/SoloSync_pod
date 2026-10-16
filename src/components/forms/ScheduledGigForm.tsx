import { Field } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import type { ActionState } from "@/app/actions/types";
import { SCHEDULED_STATUSES, type GigPlatform, type ScheduledGig, type Vehicle } from "@/lib/types";
import { toLocalInput } from "@/lib/tz";

export function ScheduledGigForm({
  action,
  gig,
  platforms,
  vehicles,
  tz,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  gig?: ScheduledGig | null;
  platforms: GigPlatform[];
  vehicles: Vehicle[];
  tz: string;
}) {
  const statuses = gig && !SCHEDULED_STATUSES.some((s) => s.value === gig.status)
    ? [...SCHEDULED_STATUSES, { value: gig.status, label: gig.status }]
    : SCHEDULED_STATUSES;
  return (
    <ActionForm action={action} submitLabel={gig ? "Save changes" : "Add gig"} cancelHref="/scheduled">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Platform">
          <select className="input" name="platform_id" defaultValue={gig?.platform_id ?? platforms[0]?.id ?? ""}>
            <option value="">—</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" name="status" defaultValue={gig?.status ?? "upcoming"}>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pickup time" hint={`Times are in ${tz}`}>
          <input className="input" type="datetime-local" name="pickup_time" defaultValue={gig ? toLocalInput(gig.pickup_time, tz) : ""} required />
        </Field>
        <Field label="Dropoff time">
          <input className="input" type="datetime-local" name="dropoff_time" defaultValue={toLocalInput(gig?.dropoff_time, tz)} />
        </Field>
        <Field label="Pickup business">
          <input className="input" name="pickup_business" defaultValue={gig?.pickup_business ?? ""} />
        </Field>
        <Field label="Pickup address">
          <input className="input" name="pickup_location" defaultValue={gig?.pickup_location ?? ""} required />
        </Field>
        <Field label="Dropoff business">
          <input className="input" name="dropoff_business" defaultValue={gig?.dropoff_business ?? ""} />
        </Field>
        <Field label="Dropoff address">
          <input className="input" name="dropoff_location" defaultValue={gig?.dropoff_location ?? ""} />
        </Field>
        <Field label="Order number">
          <input className="input" name="order_number" defaultValue={gig?.order_number ?? ""} />
        </Field>
        <Field label="Merchant">
          <input className="input" name="merchant" defaultValue={gig?.merchant ?? ""} />
        </Field>
        <Field label="Expected base pay ($)">
          <input className="input" type="number" step="0.01" min="0" name="expected_base_pay" defaultValue={gig?.expected_base_pay ?? ""} />
        </Field>
        <Field label="Expected tips ($)">
          <input className="input" type="number" step="0.01" min="0" name="expected_tips" defaultValue={gig?.expected_tips ?? ""} />
        </Field>
        <Field label="Expected fees ($)">
          <input className="input" type="number" step="0.01" min="0" name="expected_fees" defaultValue={gig?.expected_fees ?? ""} />
        </Field>
        <Field label="Expected earnings ($)" hint="Blank = base + tips − fees">
          <input className="input" type="number" step="0.01" min="0" name="expected_earnings" defaultValue={gig?.expected_earnings ?? ""} />
        </Field>
        <Field label="Item count">
          <input className="input" type="number" step="1" min="0" name="item_count" defaultValue={gig?.item_count ?? ""} />
        </Field>
        <Field label="Vehicle">
          <select className="input" name="vehicle_id" defaultValue={gig?.vehicle_id ?? ""}>
            <option value="">—</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea className="input" name="notes" rows={3} defaultValue={gig?.notes ?? ""} />
        </Field>
      </div>
    </ActionForm>
  );
}
