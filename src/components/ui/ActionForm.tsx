"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/actions/types";

export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  cancelHref,
  className = "",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  cancelHref?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={`space-y-4 ${className}`}>
      {children}
      {state?.error && (
        <p role="alert" className="rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="btn-ghost">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
