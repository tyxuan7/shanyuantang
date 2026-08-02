import { NextRequest, NextResponse } from "next/server";
import { queryOne, OrderRow } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("order_id");
    if (!orderId) return NextResponse.json({ error: "请提供 order_id" }, { status: 400 });

    const order = await queryOne<OrderRow>("orders", o => o.id === orderId);
    if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

    return NextResponse.json({
      success: true,
      status: order.status,
      paid: order.status === "paid",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
