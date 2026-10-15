import { Field } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import type { ActionState } from "@/app/actions/types";
import type { AdjustmentPayEntry, GigPlatform } from "@/lib/types";
import { toLocalInput } from "@/lib/tz";

export function AdjustmentForm({
  action,
  entry,
  platforms,
  tz,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  entry?: AdjustmentPayEntry | null;
  platforms: GigPlatform[];
  tz: string;
}) {
  return (
    <ActionForm action={action} submitLabel={entry ? "Save changes" : "Add entry"} cancelHref="/adjustments">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount ($)" hint="Prop 22 / guaranteed-minimum top-ups, bonuses, or negative corrections">
          <input className="input" type="number" step="0.01" name="amount" defaultValue={entry?.amount ?? ""} required />
        </Field>
        <Field label="Platform">
          <select className="input" name="platform_id" defaultValue={entry?.platform_id ?? ""}>
            <option value="">—</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Paid on" hint={`Times are in ${tz}`}>
          <input className="input" type="datetime-local" name="entry_date" defaultValue={entry ? toLocalInput(entry.entry_date, tz) : toLocalInput(new Date(), tz)} required />
        </Field>
        <Field label="Pay period start">
          <input className="input" type="date" name="pay_period_start" defaultValue={entry?.pay_period_start ?? ""} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea className="input" name="notes" rows={3} defaultValue={entry?.notes ?? ""} />
        </Field>
      </div>
    </ActionForm>
  );
}
