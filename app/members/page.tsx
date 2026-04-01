import { permanentRedirect } from "next/navigation";

/** Friendly alias: member benefits surface from `/library` today. */
export default function MembersPage() {
  permanentRedirect("/library");
}
