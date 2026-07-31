import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }

    const result = await loginUser(username, password);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      user: result.user,
      token: result.token,
    });
  } catch (e) {
    console.error("[登录] 错误:", e);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
