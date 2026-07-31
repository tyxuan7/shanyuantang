import { NextRequest, NextResponse } from "next/server";
import { sql, now, update } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

interface OrderWithUser extends RowDataPacket {
  id: string; user_id: string; product_name: string; amount: number;
  status: string; payee_name: string; created_at: string; paid_at: string | null;
  guest_number: number; nickname: string;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");
  const status = searchParams.get("status");

  let query = `SELECT o.*, COALESCE(u.guest_number,0) as guest_number, COALESCE(u.nickname,'未知') as nickname
    FROM orders o LEFT JOIN users u ON o.user_id = u.id`;
  const params: (string | number)[] = [];
  if (status) { query += " WHERE o.status = ?"; params.push(status); }
  query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const orders = await sql<OrderWithUser>(query, params);
  return NextResponse.json({ orders, total: orders.length, limit, offset });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { order_id, status } = await request.json();
  if (!order_id || !status) return NextResponse.json({ error: "请提供 order_id 和 status" }, { status: 400 });
  const upd: Record<string, unknown> = { status };
  if (status === "paid") upd.paid_at = now();
  await update("orders", (o) => o.id === order_id, upd);
  return NextResponse.json({ success: true });
}
