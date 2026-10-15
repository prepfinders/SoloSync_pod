import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getPlatforms, getProfile, getSession, getVehicles, tzOf } from "@/lib/queries";
import { deleteSession, updateSession } from "@/app/actions/sessions";
import { SessionForm } from "@/components/forms/SessionForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { fmtDateTime, fmtDuration, fmtMoney } from "@/lib/format";
import { breakSeconds, sessionGross, sessionHourly, sessionPerMile, sessionTaxDeduction } from "@/lib/metrics";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const [profile, platforms, vehicles, session] = await Promise.all([
    getProfile(supabase, user.id),
    getPlatforms(supabase),
    getVehicles(supabase),
    getSession(supabase, id),
  ]);
  if (!session) notFound();
  const tz = tzOf(profile);
  const breaks = session.break_periods ?? [];

  return (
    <>
      <PageHeader
        title="Edit session"
        description={`${fmtDateTime(session.start_time, tz)} · synced from ${session.device_id ?? "unknown device"}`}
        action={<DeleteButton action={deleteSession.bind(null, id)} label="Delete session" />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SessionForm action={updateSession.bind(null, id)} session={session} platforms={platforms} vehicles={vehicles} tz={tz} />
        </Card>
        <div className="space-y-4">
          <Card title="Summary">
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-ink-2">Gross</dt>
              <dd className="tnum text-right">{fmtMoney(sessionGross(session))}</dd>
              <dt className="text-ink-2">Per hour</dt>
              <dd className="tnum text-right">{fmtMoney(sessionHourly(session))}</dd>
              <dt className="text-ink-2">Per mile</dt>
              <dd className="tnum text-right">{fmtMoney(sessionPerMile(session))}</dd>
              <dt className="text-ink-2">IRS deduction</dt>
              <dd className="tnum text-right">{fmtMoney(sessionTaxDeduction(session))}</dd>
              <dt className="text-ink-2">Break time</dt>
              <dd className="tnum text-right">{fmtDuration(breakSeconds(session))}</dd>
            </dl>
          </Card>
          <Card title="Breaks" subtitle="Recorded by the app while tracking">
            {breaks.length === 0 ? (
              <p className="text-sm text-muted">No breaks.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {breaks.map((b) => (
                  <li key={b.id} className="flex justify-between gap-2">
                    <span className="text-ink-2">
                      {fmtDateTime(b.start_time, tz)}
                      {b.reason ? ` · ${b.reason}` : ""}
                    </span>
                    <span className="tnum">
                      {fmtDuration(
                        b.end_time ? (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 1000 : 0,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
