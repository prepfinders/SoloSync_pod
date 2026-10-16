export function PlatformDot({ color, name }: { color?: string | null; name: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color || "var(--s-other)" }}
      />
      <span>{name}</span>
    </span>
  );
}
