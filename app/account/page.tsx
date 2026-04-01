import { permanentRedirect } from "next/navigation";

/** Account hub not split out yet — library is the signed-in home. */
export default function AccountPage() {
  permanentRedirect("/library");
}
