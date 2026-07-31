import { NextRequest, NextResponse } from "next/server";
import { now, getCount, insert, UserRow } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const userCount = await getCount("users");
    if (userCount > 0) return NextResponse.json({ error: "已存在用户，不能重复初始化" }, { status: 403 });
    const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ error: "请提供 username 和 password" }, { status: 400 });
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: UserRow = { id: uuidv4(), username, password_hash: passwordHash, nickname: "管理员", avatar: "", phone: "", role: "admin", permission: 0, balance: 0, guest_number: 0, created_at: now() };
    await insert("users", newUser as unknown as Record<string, unknown>);
    return NextResponse.json({ success: true, message: "管理员账号创建成功", username });
  } catch (e) { console.error(e); return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
