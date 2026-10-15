import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-ink text-xl font-bold">
            S
          </div>
          <h1 className="text-xl font-semibold text-ink">SoloSync Dashboard</h1>
          <p className="mt-1 text-sm text-ink-2">
            Sign in with the same email and password you use in the SoloSync iOS app.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <LoginForm next={next} />
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Signed up with Apple only? Use &ldquo;Reset password&rdquo; in the iOS app to set a password
          for your account email first.
        </p>
      </div>
    </main>
  );
}
