import { Field } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import type { ActionState } from "@/app/actions/types";
import type { GigPlatform, GigSession, Vehicle } from "@/lib/types";
import { toLocalInput } from "@/lib/tz";

export function SessionForm({
  action,
  session,
  platforms,
  vehicles,
  tz,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  session?: GigSession | null;
  platforms: GigPlatform[];
  vehicles: Vehicle[];
  tz: string;
}) {
  const secs = Number(session?.total_engaged_seconds ?? 0);
  const eh = Math.floor(secs / 3600);
  const em = Math.round((secs % 3600) / 60);
  const defaultStart = session ? toLocalInput(session.start_time, tz) : toLocalInput(new Date(), tz);
  const defaultVehicle = session?.vehicle_id ?? vehicles.find((v) => v.is_default)?.id ?? "";

  return (
    <ActionForm action={action} submitLabel={session ? "Save changes" : "Log session"} cancelHref="/sessions">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Platform">
          <select className="input" name="platform_id" defaultValue={session?.platform_id ?? platforms[0]?.id ?? ""} required>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.is_active === false ? " (inactive)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vehicle">
          <select className="input" name="vehicle_id" defaultValue={defaultVehicle}>
            <option value="">—</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Start" hint={`Times are in ${tz}`}>
          <input className="input" type="datetime-local" name="start_time" defaultValue={defaultStart} required />
        </Field>
        <Field label="End">
          <input className="input" type="datetime-local" name="end_time" defaultValue={toLocalInput(session?.end_time, tz)} />
        </Field>
        <Field label="Engaged time" hint="Leave blank to use end − start" className="sm:col-span-2">
          <div className="flex gap-2">
            <input className="input" type="number" name="engaged_hours" min="0" step="1" placeholder="hours" defaultValue={session ? eh : ""} />
            <input className="input" type="number" name="engaged_minutes" min="0" max="59" step="1" placeholder="minutes" defaultValue={session ? em : ""} />
          </div>
        </Field>
        <Field label="Total miles (GPS)">
          <input className="input" type="number" name="total_miles" step="0.1" min="0" defaultValue={session?.total_miles ?? ""} />
        </Field>
        <Field label="Engaged miles" hint="Optional override; defaults to total miles">
          <input className="input" type="number" name="engaged_miles" step="0.1" min="0" defaultValue={session?.engaged_miles ?? ""} />
        </Field>
        <Field label="Tax-deductible miles" hint="Defaults to engaged miles">
          <input className="input" type="number" name="tax_deductible_miles" step="0.1" min="0" defaultValue={session?.tax_deductible_miles ?? ""} />
        </Field>
        <Field label="Energy used (kWh)">
          <input className="input" type="number" name="energy_used" step="0.01" min="0" defaultValue={session?.energy_used ?? ""} />
        </Field>
        <Field label="Base earnings ($)">
          <input className="input" type="number" name="earnings" step="0.01" min="0" defaultValue={session?.earnings ?? ""} />
        </Field>
        <Field label="Tips ($)">
          <input className="input" type="number" name="tips" step="0.01" min="0" defaultValue={session?.tips ?? ""} />
        </Field>
        <Field label="Adjustment pay ($)" hint="Top-ups or bonuses paid on this session; counted in gross">
          <input className="input" type="number" name="adjustment_pay" step="0.01" defaultValue={session?.adjustment_pay ?? ""} />
        </Field>
        <Field label="Safety & admin fee ($)">
          <input className="input" type="number" name="safety_admin_fee" step="0.01" min="0" defaultValue={session?.safety_admin_fee ?? ""} />
        </Field>
        <Field label="Order / route numbers" hint="Comma-separated">
          <input className="input" name="order_numbers" defaultValue={(session?.order_numbers ?? []).join(", ")} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea className="input" name="notes" rows={3} defaultValue={session?.notes ?? ""} />
        </Field>
      </div>
    </ActionForm>
  );
}
