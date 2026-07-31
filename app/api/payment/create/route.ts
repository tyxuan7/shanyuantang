import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { now, insert, sql, OrderRow } from "@/lib/db";
import { extractToken, getUserFromToken } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

const PRODUCTS: Record<string, { name: string; amount: number }> = {
  single_bazi_deep: { name: "八字精批深度版", amount: 2990 },
  single_bazi_lite: { name: "八字精批简版", amount: 990 },
  naming_premium: { name: "起名高级版", amount: 3990 },
  naming_basic: { name: "起名基础版", amount: 1990 },
  year_luck: { name: "流年运势", amount: 1990 },
  dream_premium: { name: "深度解梦", amount: 990 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_type, pay_method } = body;
    const product = PRODUCTS[product_type];
    if (!product) return NextResponse.json({ error: "无效的产品类型" }, { status: 400 });
    if (!pay_method || !["wechat", "alipay"].includes(pay_method)) return NextResponse.json({ error: "请选择微信或支付宝" }, { status: 400 });

    // JWT 或 guest header
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

    const orderId = uuidv4();
    const order: OrderRow = { id: orderId, user_id: userId, product_type, product_name: product.name, amount: product.amount, status: "pending", payee_name: "善缘堂", result: "", created_at: now(), paid_at: null };
    await insert("orders", order as unknown as Record<string, unknown>);
    const qrUrl = pay_method === "wechat" ? `weixin://wxpay/bizpayurl?pr=${orderId.slice(0,16)}` : `alipays://platformapi/startapp?appId=20000067&orderId=${orderId.slice(0,16)}`;
    return NextResponse.json({ order, payment: { method: pay_method, qr_url: qrUrl, amount_yuan: (product.amount / 100).toFixed(2), order_id: orderId }, message: `请扫码支付 ¥${(product.amount / 100).toFixed(2)}` });
  } catch (e) { console.error(e); return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
