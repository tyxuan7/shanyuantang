import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { now, sql } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

const DURATION_DAYS: Record<string, number> = {
  month: 30, "100days": 100, year: 365, forever: 0,
};

export async function POST(request: NextRequest) {
  try {
    const { blessing_type, pilgrim_name, blessing_text, duration } = await request.json();
    if (!blessing_type) return NextResponse.json({ error: "请选择祈福类型" }, { status: 400 });

    let userId: string | null = null;
    const guestNum = request.headers.get("x-guest-number");
    if (guestNum) {
      const rows = await sql<RowDataPacket & { id: string }>(
        "SELECT id FROM users WHERE guest_number = ?", [parseInt(guestNum)]
      );
      if (rows[0]) userId = rows[0].id;
    }

    const id = uuidv4();
    const name = pilgrim_name || "善信";
    const text = blessing_text || "";
    const dur = duration || "forever";
    const days = DURATION_DAYS[dur] || 0;

    // 计算到期时间
    let expiresAt = null;
    if (days > 0) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      expiresAt = d.toISOString().slice(0,19).replace("T"," ");
    }

    await sql(
      "INSERT INTO blessings (id, user_id, pilgrim_name, blessing_type, duration, blessing_text, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, userId, name, blessing_type, dur, text, now(), expiresAt]
    );

    const rows = await sql<RowDataPacket>("SELECT * FROM blessings WHERE id = ?", [id]);
    return NextResponse.json({ blessing: rows[0] });
  } catch (e) { console.error(e); return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
