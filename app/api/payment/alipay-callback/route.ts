import { NextRequest, NextResponse } from "next/server";
import { sql, now, update } from "@/lib/db";
import { verifyCallback } from "@/lib/alipay";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    const params: Record<string, string> = {};
    raw.split("&").forEach(p => {
      const [k, v] = p.split("=");
      if (k) params[k] = decodeURIComponent(v || "");
    });

    console.log("[支付宝回调]", params.trade_status, params.out_trade_no);

    // 验证签名
    if (process.env.ALIPAY_APP_ID && !verifyCallback(params)) {
      console.error("支付宝回调签名验证失败");
      return new NextResponse("fail", { status: 400 });
    }

    const outTradeNo = params.out_trade_no;
    const tradeStatus = params.trade_status;

    if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
      await update("orders", (o) => o.id === outTradeNo, {
        status: "paid",
        paid_at: now(),
      });

      const order = (await sql<RowDataPacket>(
        "SELECT * FROM orders WHERE id = ?", [outTradeNo]
      ))[0] as any;

      // 生产环境可以在这里触发后续业务逻辑
      console.log("[支付宝] 订单支付成功:", outTradeNo, order?.product_name);
    }

    return new NextResponse("success");
  } catch (e) {
    console.error("[支付宝回调] 异常:", e);
    return new NextResponse("fail", { status: 500 });
  }
}
