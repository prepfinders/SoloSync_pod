import { requireUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries";
import { updateProfile } from "@/app/actions/catalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import { IRS_MILEAGE_RATE } from "@/lib/metrics";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  return (
    <>
      <PageHeader title="Settings" description={`Signed in as ${user.email}. These rates drive the reimbursement and energy-cost figures.`} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ActionForm action={updateProfile} submitLabel="Save settings">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input className="input" name="full_name" defaultValue={profile?.full_name ?? ""} />
              </Field>
              <Field label="Timezone" hint="IANA name, e.g. America/Los_Angeles">
                <input className="input" name="timezone" defaultValue={profile?.timezone ?? "America/Los_Angeles"} />
              </Field>
              <Field label="Mileage reimbursement rate ($/mi)" hint="Prop 22 engaged-mile rate; default 0.37">
                <input className="input" type="number" step="0.001" min="0" name="mileage_reimbursement_rate" defaultValue={profile?.mileage_reimbursement_rate ?? ""} />
              </Field>
              <Field label="Energy cost ($/kWh)" hint="Default 0.227">
                <input className="input" type="number" step="0.001" min="0" name="energy_cost_per_kwh" defaultValue={profile?.energy_cost_per_kwh ?? ""} />
              </Field>
              <Field label="Hourly target ($/hr)">
                <input className="input" type="number" step="0.01" min="0" name="default_hourly_target" defaultValue={profile?.default_hourly_target ?? ""} />
              </Field>
            </div>
          </ActionForm>
        </Card>
        <Card title="How numbers are computed">
          <ul className="space-y-2 text-sm text-ink-2">
            <li>
              <strong className="text-ink">Gross</strong> = base earnings + tips.
            </li>
            <li>
              <strong className="text-ink">Engaged miles</strong> = the session&rsquo;s engaged-miles override, otherwise GPS total miles.
            </li>
            <li>
              <strong className="text-ink">IRS deduction</strong> = tax-deductible miles × ${IRS_MILEAGE_RATE} (fixed in the app).
            </li>
            <li>
              <strong className="text-ink">Taxable income</strong> = gross − IRS deduction − expenses − safety &amp; admin fees.
            </li>
            <li>
              <strong className="text-ink">Mileage reimbursement</strong> = engaged miles × your mileage rate.
            </li>
            <li>
              <strong className="text-ink">Energy cost</strong> = kWh used × your energy rate.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
