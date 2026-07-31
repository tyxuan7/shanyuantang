import { NextRequest, NextResponse } from "next/server";
import { now, queryOne, update, sql, OrderRow } from "@/lib/db";
import { extractToken, getUserFromToken } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    const { order_id } = await request.json();
    if (!order_id) return NextResponse.json({ error: "请提供 order_id" }, { status: 400 });

    let userId: string | null = null;
    const token = extractToken(request);
    if (token) {
      const user = await getUserFromToken(token);
      if (user) userId = user.id;
    }
    if (!userId) {
      const guestNum = request.headers.get("x-guest-number");
      if (guestNum) {
        const rows = await sql<RowDataPacket & { id: string }>(
          "SELECT id FROM users WHERE guest_number = ?", [parseInt(guestNum)]
        );
        if (rows[0]) userId = rows[0].id;
      }
    }

    const order = await queryOne<OrderRow>("orders", o => o.id === order_id);
    if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    if (userId && order.user_id && order.user_id !== userId) return NextResponse.json({ error: "无权操作" }, { status: 403 });
    if (order.status !== "pending") return NextResponse.json({ error: "订单状态异常" }, { status: 400 });

    await update("orders", o => o.id === order_id, { status: "paid", paid_at: now() });
    const updated = await queryOne<OrderRow>("orders", o => o.id === order_id);
    return NextResponse.json({ success: true, message: "支付成功！福生无量天尊。", order: updated });
  } catch (e) { console.error(e); return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
