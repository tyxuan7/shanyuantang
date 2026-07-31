import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  const guestNum = request.headers.get("x-guest-number");
  if (!guestNum) return NextResponse.json({ error: "未识别访客" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "blessings";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  // 通过 guest_number 找到 user_id，再查记录
  const userId = (await sql<RowDataPacket & { id: string }>(
    "SELECT id FROM users WHERE guest_number = ?", [parseInt(guestNum)]
  ))[0]?.id || null;

  let query = "";
  switch (type) {
    case "blessings":
      query = `SELECT id, pilgrim_name, blessing_type, blessing_text, created_at FROM blessings WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`;
      break;
    case "lottery":
      query = `SELECT id, lot_number, poem, interpretation, master, created_at FROM lottery_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`;
      break;
    case "bazi":
      query = `SELECT id, name, birth_date, result_text, created_at FROM bazi_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`;
      break;
    case "dream":
      query = `SELECT id, dream_text, result_text, created_at FROM dream_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`;
      break;
    case "naming":
      query = `SELECT id, surname, gender, birth_date, style, result_text, created_at FROM naming_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`;
      break;
    case "orders":
      query = `SELECT id, product_name, amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`;
      break;
    default:
      return NextResponse.json({ items: [] });
  }

  const items = await sql<RowDataPacket>(query, [userId, limit]);
  return NextResponse.json({ items });
}
