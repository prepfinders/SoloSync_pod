import { Nav } from "@/components/Nav";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);
  const name = profile?.full_name || user.email || "Account";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-ink text-sm font-bold">
              S
            </span>
            <span className="text-sm font-semibold text-ink">SoloSync</span>
          </div>
          <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
            <Nav />
          </div>
          <form action={signOut} className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-ink-2 sm:inline">{name}</span>
            <button type="submit" className="btn-ghost !py-1 text-xs">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
