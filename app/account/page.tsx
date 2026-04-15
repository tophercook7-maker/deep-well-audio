import { permanentRedirect } from "next/navigation";

/** Subscriber hub lives on the dashboard; library remains the saves surface. */
export default function AccountPage() {
  permanentRedirect("/dashboard");
}
