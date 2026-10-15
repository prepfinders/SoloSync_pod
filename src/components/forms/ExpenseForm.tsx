import { Field } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import type { ActionState } from "@/app/actions/types";
import { EXPENSE_TYPES, type Expense, type Vehicle } from "@/lib/types";
import { toLocalInput } from "@/lib/tz";

export function ExpenseForm({
  action,
  expense,
  vehicles,
  tz,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  expense?: Expense | null;
  vehicles: Vehicle[];
  tz: string;
}) {
  return (
    <ActionForm action={action} submitLabel={expense ? "Save changes" : "Add expense"} cancelHref="/expenses">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <select className="input" name="expense_type" defaultValue={expense?.expense_type ?? "evCharging"}>
            {EXPENSE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount ($)">
          <input className="input" type="number" step="0.01" min="0" name="amount" defaultValue={expense?.amount ?? ""} required />
        </Field>
        <Field label="Date" hint={`Times are in ${tz}`}>
          <input className="input" type="datetime-local" name="expense_date" defaultValue={expense ? toLocalInput(expense.expense_date, tz) : toLocalInput(new Date(), tz)} required />
        </Field>
        <Field label="Vehicle">
          <select className="input" name="vehicle_id" defaultValue={expense?.vehicle_id ?? vehicles.find((v) => v.is_default)?.id ?? ""}>
            <option value="">—</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="kWh charged" hint="EV charging">
          <input className="input" type="number" step="0.01" min="0" name="kwh_charged" defaultValue={expense?.kwh_charged ?? ""} />
        </Field>
        <Field label="Price per kWh ($)">
          <input className="input" type="number" step="0.001" min="0" name="price_per_kwh" defaultValue={expense?.price_per_kwh ?? ""} />
        </Field>
        <Field label="Gallons" hint="Gasoline">
          <input className="input" type="number" step="0.001" min="0" name="gallons" defaultValue={expense?.gallons ?? ""} />
        </Field>
        <Field label="Price per gallon ($)">
          <input className="input" type="number" step="0.001" min="0" name="price_per_gallon" defaultValue={expense?.price_per_gallon ?? ""} />
        </Field>
        <Field label="Location">
          <input className="input" name="location_name" defaultValue={expense?.location_name ?? ""} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea className="input" name="notes" rows={3} defaultValue={expense?.notes ?? ""} />
        </Field>
      </div>
    </ActionForm>
  );
}
