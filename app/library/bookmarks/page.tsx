import { permanentRedirect } from "next/navigation";

/** Bookmarks and episode notes are managed from the premium dashboard today. */
export default function LibraryBookmarksPage() {
  permanentRedirect("/dashboard#notes");
}
