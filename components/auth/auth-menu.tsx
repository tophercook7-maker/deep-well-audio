import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/logout-button";

export function AuthMenu({ user }: { user: User | null }) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-text"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Join
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[10rem] truncate text-sm text-muted md:inline">{user.email}</span>
      <Link href="/library" className="text-sm text-amber-200 hover:text-white">
        Library
      </Link>
      <LogoutButton />
    </div>
  );
}
