import { NextRequest, NextResponse } from "next/server";
import { sql, update, remove } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { RowDataPacket } from "mysql2/promise";

interface UserView extends RowDataPacket {
  id: string; username: string; nickname: string;
  role: string; balance: number; created_at: string;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search") || "";

  const rows = await sql<UserView>(
    "SELECT id, username, nickname, role, balance, created_at FROM users ORDER BY created_at DESC"
  );

  let filtered = rows;
  if (search) filtered = rows.filter(u => u.username.includes(search) || u.nickname.includes(search));

  const users = filtered.slice(offset, offset + limit);

  return NextResponse.json({ users, total: filtered.length, limit, offset });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { user_id, role, balance, nickname } = await request.json();
  if (!user_id) return NextResponse.json({ error: "请提供 user_id" }, { status: 400 });
  const upd: Record<string, unknown> = {};
  if (role) upd.role = role;
  if (balance !== undefined) upd.balance = balance;
  if (nickname) upd.nickname = nickname;
  const n = await update("users", (u) => u.id === user_id, upd);
  return NextResponse.json({ success: true, updated: n });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { user_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: "请提供 user_id" }, { status: 400 });
  await remove("users", (u) => u.id === user_id);
  return NextResponse.json({ success: true });
}
