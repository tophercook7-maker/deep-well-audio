import { redirect } from "next/navigation";

/** Legacy URL — discovery lives on `/browse`. */
export default async function ExploreRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const p = new URLSearchParams();
  for (const [key, val] of Object.entries(sp)) {
    if (typeof val === "string" && val.length) p.set(key, val);
    else if (Array.isArray(val) && val[0]) p.set(key, val[0]);
  }
  const qs = p.toString();
  redirect(qs ? `/browse?${qs}` : "/browse");
}
