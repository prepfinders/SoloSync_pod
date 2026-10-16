import { Field } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import type { ActionState } from "@/app/actions/types";
import type { GigPlatform } from "@/lib/types";

export function PlatformForm({
  action,
  platform,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  platform?: GigPlatform | null;
}) {
  return (
    <ActionForm action={action} submitLabel={platform ? "Save changes" : "Add platform"} cancelHref="/platforms">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className="input" name="name" defaultValue={platform?.name ?? ""} required />
        </Field>
        <Field label="App color" hint="Used by the iOS app; the web dashboard uses a fixed accessible palette">
          <div className="flex items-center gap-2">
            <input type="color" name="color_hex" defaultValue={platform?.color_hex ?? "#007AFF"} className="h-9 w-12 cursor-pointer rounded border border-line bg-surface" />
            <span className="text-xs text-muted">{platform?.color_hex ?? "#007AFF"}</span>
          </div>
        </Field>
        <Field label="Hourly target ($/hr)">
          <input className="input" type="number" step="0.01" min="0" name="default_hourly_target" defaultValue={platform?.default_hourly_target ?? ""} />
        </Field>
        <Field label="SF Symbol icon" hint="Icon name shown in the app, e.g. briefcase.fill">
          <input className="input" name="icon_name" defaultValue={platform?.icon_name ?? "briefcase.fill"} />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="is_active" defaultChecked={platform ? platform.is_active !== false : true} />
          Active (shown when starting a gig)
        </label>
      </div>
    </ActionForm>
  );
}
