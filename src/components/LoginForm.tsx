"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  { name: "Alice", email: "alice@demo.com", blurb: "owner" },
  { name: "Bob", email: "bob@demo.com", blurb: "editor" },
  { name: "Carol", email: "carol@demo.com", blurb: "viewer" },
];
const DEMO_PASSWORD = "password123";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent, overrideEmail?: string, overridePassword?: string) {
    e.preventDefault();
    setError(null);
    const useEmail = overrideEmail ?? email;
    const usePassword = overridePassword ?? password;
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: useEmail,
        password: usePassword,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password");
        return;
      }
      toast.success("Signed in");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@demo.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-3 text-xs text-[var(--muted-2)]">
          <div className="h-px flex-1 bg-[var(--border)]" />
          demo accounts (password: {DEMO_PASSWORD})
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={pending}
              onClick={(e) => {
                setEmail(acc.email);
                setPassword(DEMO_PASSWORD);
                submit(e, acc.email, DEMO_PASSWORD);
              }}
              className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2.5 text-center text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
            >
              <div>{acc.name}</div>
              <div className="mt-0.5 font-normal text-[var(--muted-2)]">{acc.blurb}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
