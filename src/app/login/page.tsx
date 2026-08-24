import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--accent-soft),_var(--background)_60%)] px-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-lg font-bold text-white shadow-lg shadow-[var(--accent)]/20">
            C
          </div>
          <h1 className="text-xl font-semibold tracking-tight">CollabDocs</h1>
          <p className="text-sm text-[var(--muted)]">
            A lightweight collaborative document editor
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
