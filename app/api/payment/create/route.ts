import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sql, now, insert, OrderRow } from "@/lib/db";
import { createAlipayOrder } from "@/lib/alipay";
import type { RowDataPacket } from "mysql2/promise";

const PRODUCTS: Record<string, { name: string; amount: number }> = {
  single_bazi_deep: { name: "八字精批深度版", amount: 2990 },
  single_bazi_lite: { name: "八字精批简版", amount: 990 },
  naming_premium: { name: "起名高级版", amount: 3990 },
  naming_basic: { name: "起名基础版", amount: 1990 },
  year_luck: { name: "流年运势", amount: 1990 },
  dream_premium: { name: "深度解梦", amount: 990 },
  blessing_lamp: { name: "心愿供灯", amount: 390 },
  blessing_100: { name: "百日供奉", amount: 590 },
  blessing_year: { name: "一年供奉", amount: 990 },
  blessing_forever: { name: "永久长明", amount: 1990 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_type, pay_method } = body;
    const product = PRODUCTS[product_type] || { name: "功德随喜", amount: body.amount || 990 };
    if (body.amount) product.amount = body.amount;

    let userId: string | null = null;
    const gn = request.headers.get("x-guest-number");
    if (gn) {
      const r = await sql<RowDataPacket & { id: string }>(
        "SELECT id FROM users WHERE guest_number = ?", [parseInt(gn)]
      );
      if (r[0]) userId = r[0].id;
    }

    const orderId = uuidv4();
    const order: OrderRow = {
      id: orderId, user_id: userId, product_type: product_type || "custom",
      product_name: product.name, amount: product.amount,
      status: "pending", payee_name: "善缘堂", result: "",
      created_at: now(), paid_at: null,
    };
    await insert("orders", order as unknown as Record<string, unknown>);

    // 支付宝真实支付
    if (pay_method === "alipay" && process.env.ALIPAY_APP_ID) {
      try {
        const result = await createAlipayOrder(
          orderId,
          product.name,
          (product.amount / 100).toFixed(2)
        );
        return NextResponse.json({
          order,
          payment: {
            method: "alipay",
            qr_url: result.qr_code,
            amount_yuan: (product.amount / 100).toFixed(2),
            order_id: orderId,
          },
          message: `请使用支付宝扫码支付 ¥${(product.amount / 100).toFixed(2)}`,
        });
      } catch (e: any) {
        console.error("支付宝支付创建失败:", e.message);
      }
    }

    // 支付宝未配置 / 微信支付 → 模拟支付
    const qrUrl = pay_method === "wechat"
      ? `weixin://wxpay/bizpayurl?pr=${orderId.slice(0, 16)}`
      : `alipays://platformapi/startapp?appId=20000067&orderId=${orderId.slice(0, 16)}`;

    return NextResponse.json({
      order,
      payment: {
        method: pay_method || "wechat",
        qr_url: qrUrl,
        amount_yuan: (product.amount / 100).toFixed(2),
        order_id: orderId,
      },
      message: `请扫码支付 ¥${(product.amount / 100).toFixed(2)}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
