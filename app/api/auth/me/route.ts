import { NextRequest, NextResponse } from "next/server";
import { extractToken, getUserFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  if (!token) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "登录已过期" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
