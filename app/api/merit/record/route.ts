import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sql, now } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { incense_type, merit_points } = body;
    const guestNum = request.headers.get("x-guest-number");
    if (!guestNum) return NextResponse.json({ error: "未识别用户" }, { status: 400 });

    const users = await sql<RowDataPacket & { id: string; total_merit: number }>(
      "SELECT id, total_merit FROM users WHERE guest_number = ?", [parseInt(guestNum)]
    );
    if (!users[0]) return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    const userId = users[0].id;

    const points = merit_points || 5;

    // 仅对 incense 类型（上香）限制每日 3 次，禅修不限制
    if (incense_type && incense_type !== "禅修") {
      const today = now().slice(0, 10);
      const todayRecords = await sql<RowDataPacket & { c: number }>(
        "SELECT COUNT(*) as c FROM merit_records WHERE user_id = ? AND incense_type != '禅修' AND created_at LIKE ?",
        [userId, `${today}%`]
      );
      if (todayRecords[0]?.c >= 3) {
        return NextResponse.json({ error: "今日已圆满，明日再来" }, { status: 400 });
      }
    }

    const id = uuidv4();
    await sql(
      "INSERT INTO merit_records (id, user_id, incense_type, merit_points, created_at) VALUES (?,?,?,?,?)",
      [id, userId, incense_type || "檀香", points, now()]
    );
    await sql("UPDATE users SET total_merit = total_merit + ? WHERE id = ?", [points, userId]);

    const newTotal = (users[0].total_merit || 0) + points;
    return NextResponse.json({ success: true, points, total_merit: newTotal });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
