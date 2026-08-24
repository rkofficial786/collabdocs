"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar({
  user,
  center,
}: {
  user: { name: string; email: string };
  center?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-sm font-bold text-white">
          C
        </div>
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">CollabDocs</span>
      </Link>

      <div className="min-w-0 flex-1">{center}</div>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
          <Avatar name={user.name} size="sm" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="font-medium text-[var(--foreground)]">{user.name}</div>
            <div className="truncate">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
