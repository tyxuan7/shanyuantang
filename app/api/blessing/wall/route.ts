import { NextRequest, NextResponse } from "next/server";
import { sql, now } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  // 过滤已过期的灯（expires_at 为空表示永久，或 expires_at > 当前时间）
  const rows = await sql<RowDataPacket>(
    "SELECT id, pilgrim_name, blessing_type, blessing_text, duration, created_at, expires_at FROM blessings WHERE expires_at IS NULL OR expires_at > ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [now(), limit, offset]
  );
  const totalRow = await sql<RowDataPacket & { c: number }>(
    "SELECT COUNT(*) as c FROM blessings WHERE expires_at IS NULL OR expires_at > ?",
    [now()]
  );

  return NextResponse.json({ items: rows, total: totalRow[0]?.c || 0, limit, offset });
}
