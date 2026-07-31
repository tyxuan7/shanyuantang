import { NextRequest, NextResponse } from "next/server";
import { queryAll, OrderRow } from "@/lib/db";
import { extractToken, getUserFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "登录已过期" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const all = await queryAll<OrderRow>("orders", (o) => o.user_id === user.id);
  all.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return NextResponse.json({ orders: all.slice(offset, offset + limit) });
}
