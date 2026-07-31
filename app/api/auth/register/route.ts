import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json({ error: "用户名长度需在 2-20 个字符之间" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度不能少于 6 位" }, { status: 400 });
    }

    const result = await registerUser(username, password);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      user: result.user,
      token: result.token,
    });
  } catch (e) {
    console.error("[注册] 错误:", e);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
