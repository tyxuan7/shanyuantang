import { NextRequest, NextResponse } from "next/server";
import { queryAll, DreamRow } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");
  const all = await queryAll<DreamRow>("dream_records");
  all.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return NextResponse.json({ items: all.slice(offset, offset + limit), total: all.length });
}
