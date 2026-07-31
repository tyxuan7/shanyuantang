import { NextRequest, NextResponse } from "next/server";
import { getCount, queryAll, OrderRow } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const paidOrders = await queryAll<OrderRow>("orders", (o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  return NextResponse.json({ stats: {
    users: await getCount("users"),
    blessings: await getCount("blessings"),
    lottery_draws: await getCount("lottery_records"),
    palm_readings: await getCount("palm_records"),
    face_readings: await getCount("face_records"),
    naming_requests: await getCount("naming_records"),
    dream_analyses: await getCount("dream_records"),
    bazi_readings: await getCount("bazi_records"),
    orders_total: await getCount("orders"),
    orders_paid: paidOrders.length,
    revenue_cents: revenue,
    revenue_yuan: (revenue / 100).toFixed(2),
  }});
}
