"use client";

import { useTransition } from "react";

export function DeleteButton({
  action,
  label = "Delete",
  confirmText = "Delete this record? This cannot be undone.",
  className = "btn-danger",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) start(() => action());
      }}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
