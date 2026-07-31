import { NextResponse } from "next/server";
import { initGuest } from "@/lib/guest";

export async function GET() {
  const guest = await initGuest();
  return NextResponse.json(guest);
}
