"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/"} />
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-2">Email</span>
        <input className="input" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-2">Password</span>
        <input className="input" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
