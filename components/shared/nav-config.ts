/** Primary product pillars — always visible in the global header. */
export const PRIMARY_NAV = [
  { href: "/", label: "Home", key: "home" as const },
  { href: "/bible", label: "Bible", key: "bible" as const },
  { href: "/studies", label: "Studies", key: "studies" as const },
  { href: "/search", label: "Search", key: "search" as const },
] as const;

/** Secondary catalog / monetization — still global, slightly de-emphasized in UI. */
export const SECONDARY_NAV = [
  { href: "/browse", label: "Browse", key: "browse" as const },
  { href: "/world-watch", label: "World Watch", key: "worldWatch" as const },
  { href: "/library", label: "Library", key: "library" as const },
  { href: "/pricing", label: "Pricing", key: "pricing" as const },
] as const;

export const ME_NAV = [
  { href: "/me/bookmarks", label: "Bookmarks", key: "bookmarks" as const },
  { href: "/me/notes", label: "Notes", key: "notes" as const },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
