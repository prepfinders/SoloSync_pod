import type { GigPlatform } from "./types";

const SLOTS = 8;

/**
 * Assigns each platform a fixed categorical slot by creation order, so a
 * platform keeps its color regardless of filters. Past 8, platforms share
 * the neutral "other" color.
 */
export function platformColors(platforms: GigPlatform[]): Record<string, string> {
  const sorted = [...platforms].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  const out: Record<string, string> = {};
  sorted.forEach((p, i) => {
    out[p.id] = i < SLOTS ? `var(--s${i + 1})` : "var(--s-other)";
  });
  return out;
}

export const OTHER_COLOR = "var(--s-other)";

/**
 * Looks a platform up by server id or by the app-side local id. Adjustment pay
 * entries written by the iOS app reference platforms by local id.
 */
export function findPlatform(platforms: GigPlatform[], ref: string | null | undefined) {
  if (!ref) return undefined;
  return platforms.find((p) => p.id === ref) ?? platforms.find((p) => p.local_id === ref);
}
