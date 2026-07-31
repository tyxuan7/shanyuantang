import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { now, insert, OrderRow } from "@/lib/db";
import { extractToken, getUserFromToken } from "@/lib/auth";

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
    const token = extractToken(request);
    if (!token) return NextResponse.json({ error: "请先登录" }, { status: 401 });
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    const { product_type, payee_name } = await request.json();
    const product = PRODUCTS[product_type];
    if (!product) return NextResponse.json({ error: "无效的产品类型" }, { status: 400 });
    const order: OrderRow = { id: uuidv4(), user_id: user.id, product_type, product_name: product.name, amount: product.amount, status: "pending", payee_name: payee_name || "善缘堂", result: "", created_at: now(), paid_at: null };
    await insert("orders", order as unknown as Record<string, unknown>);
    return NextResponse.json({ order, message: `订单已创建：${product.name}，金额 ¥${(product.amount / 100).toFixed(2)}` });
  } catch (e) { console.error(e); return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
