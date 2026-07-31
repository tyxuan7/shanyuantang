import { NextRequest, NextResponse } from "next/server";
import { sql, now } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  const guestNum = request.headers.get("x-guest-number");
  if (!guestNum) return NextResponse.json({ rounds: 0, total_merit: 0 });

  const users = await sql<RowDataPacket & { id: string; total_merit: number }>(
    "SELECT id, total_merit FROM users WHERE guest_number = ?", [parseInt(guestNum)]
  );
  if (!users[0]) return NextResponse.json({ rounds: 0, total_merit: 0 });

  const today = now().slice(0, 10);
  // 仅统计上香礼数（排除禅修）
  const records = await sql<RowDataPacket & { c: number }>(
    "SELECT COUNT(*) as c FROM merit_records WHERE user_id = ? AND incense_type != '禅修' AND created_at LIKE ?",
    [users[0].id, `${today}%`]
  );

  return NextResponse.json({
    rounds: records[0]?.c || 0,
    total_merit: users[0].total_merit || 0,
    done: (records[0]?.c || 0) >= 3,
  });
}
