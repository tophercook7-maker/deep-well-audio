import { NextResponse } from "next/server";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { countUserNotesCreatedThisWeek } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ notesCreatedThisWeek: 0 });
  }
  const plan = await getUserPlan();
  if (plan !== "premium") {
    return NextResponse.json({ notesCreatedThisWeek: 0 });
  }
  const notesCreatedThisWeek = await countUserNotesCreatedThisWeek(user.id);
  return NextResponse.json({ notesCreatedThisWeek });
}
