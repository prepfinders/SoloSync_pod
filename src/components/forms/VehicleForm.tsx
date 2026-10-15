import { Field } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import type { ActionState } from "@/app/actions/types";
import { VEHICLE_TYPES, type Vehicle } from "@/lib/types";

export function VehicleForm({
  action,
  vehicle,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  vehicle?: Vehicle | null;
}) {
  return (
    <ActionForm action={action} submitLabel={vehicle ? "Save changes" : "Add vehicle"} cancelHref="/vehicles">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className="input" name="name" defaultValue={vehicle?.name ?? ""} required />
        </Field>
        <Field label="Type">
          <select className="input" name="vehicle_type" defaultValue={vehicle?.vehicle_type ?? "electric"}>
            {VEHICLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Make">
          <input className="input" name="make" defaultValue={vehicle?.make ?? ""} />
        </Field>
        <Field label="Model">
          <input className="input" name="model" defaultValue={vehicle?.model ?? ""} />
        </Field>
        <Field label="Year">
          <input className="input" type="number" step="1" min="1980" max="2100" name="year" defaultValue={vehicle?.year ?? ""} />
        </Field>
        <Field label="License plate">
          <input className="input" name="license_plate" defaultValue={vehicle?.license_plate ?? ""} />
        </Field>
        <Field label="kWh per mile" hint="EV efficiency">
          <input className="input" type="number" step="0.001" min="0" name="kwh_per_mile" defaultValue={vehicle?.kwh_per_mile ?? ""} />
        </Field>
        <Field label="Battery capacity (kWh)">
          <input className="input" type="number" step="0.1" min="0" name="battery_capacity_kwh" defaultValue={vehicle?.battery_capacity_kwh ?? ""} />
        </Field>
        <Field label="Range per charge (mi)">
          <input className="input" type="number" step="1" min="0" name="range_per_charge_miles" defaultValue={vehicle?.range_per_charge_miles ?? ""} />
        </Field>
        <Field label="Combined MPG" hint="Gas / hybrid">
          <input className="input" type="number" step="0.1" min="0" name="mpg_combined" defaultValue={vehicle?.mpg_combined ?? ""} />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="is_default" defaultChecked={vehicle?.is_default ?? false} />
          Default vehicle
        </label>
      </div>
    </ActionForm>
  );
}
