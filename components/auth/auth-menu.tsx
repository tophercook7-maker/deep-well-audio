import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/logout-button";
import type { UserPlan } from "@/lib/permissions";

/**
 * Signed-in utilities only (email + sign out). Primary destinations stay in the main nav.
 */
export function AuthMenu(props: { user: User | null; plan: UserPlan }) {
  const { user } = props;
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="hidden max-w-[10rem] truncate text-sm text-muted md:inline">{user.email}</span>
      <LogoutButton />
    </div>
  );
}
