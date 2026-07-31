/**
 * 善缘堂 — 游客/缘主系统
 *
 * 首次访问自动分配编号并写入数据库（缘主1, 缘主2...），存入 localStorage。
 * 绑定手机号后更新数据库记录。
 */

import { v4 as uuidv4 } from "uuid";
import { sql, insert, queryOne, UserRow, now } from "@/lib/db";

const GUEST_KEY = "putiyuan_guest";

export interface GuestInfo {
  id: string;       // 本地 UUID
  number: number;   // 缘主编号
  name: string;     // 缘主N
  phone: string;    // 绑定手机号（空=未绑定）
  userId: string;   // 数据库 user id
}

/** 从 localStorage 获取当前访客信息 */
export function getLocalGuest(): GuestInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** 保存到 localStorage */
export function saveLocalGuest(info: GuestInfo) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_KEY, JSON.stringify(info));
}

/** 服务端：获取下一个缘主编号 */
export async function getNextGuestNumber(): Promise<number> {
  const rows = await sql<{ c: number } & import("mysql2").RowDataPacket>(
    "SELECT COALESCE(MAX(guest_number), 0) + 1 as c FROM users"
  );
  return rows[0]?.c || 1;
}

/** 服务端：初始化游客 — 立即写入数据库 */
export async function initGuest(): Promise<GuestInfo> {
  const number = await getNextGuestNumber();
  const userId = uuidv4();
  const nowTs = now();

  // 立即在数据库中创建用户记录
  const newUser: UserRow = {
    id: userId,
    username: `guest_${number}`,
    password_hash: "",
    nickname: `缘主${number}`,
    avatar: "",
    phone: "",
    role: "user",
    permission: 1,
    balance: 0,
    guest_number: number,
    created_at: nowTs,
  };
  await insert("users", newUser as unknown as Record<string, unknown>);

  return {
    id: uuidv4(),   // 本地标识 UUID
    number,
    name: `缘主${number}`,
    phone: "",
    userId,
  };
}

/** 服务端：绑定手机号 → 更新数据库 */
export async function bindPhone(
  guestNumber: number,
  phone: string
): Promise<{ userId: string; name: string } | { error: string }> {
  const exist = await queryOne<UserRow>("users", (u) => u.phone === phone);
  if (exist) return { error: "该手机号已被绑定" };

  const byNumber = await queryOne<UserRow>("users", (u) => u.guest_number === guestNumber);
  if (byNumber) {
    await import("@/lib/db").then(m => m.update("users", (u: Record<string, unknown>) => u.guest_number === guestNumber, { phone }));
    return { userId: byNumber.id, name: byNumber.nickname || `缘主${guestNumber}` };
  }

  // 兜底：如果 DB 中没有记录（极端情况），新建
  const userId = uuidv4();
  const newUser: UserRow = {
    id: userId, username: `guest_${guestNumber}`, password_hash: "",
    nickname: `缘主${guestNumber}`, avatar: "", phone, role: "user", permission: 1,
    balance: 0, guest_number: guestNumber, created_at: now(),
  };
  await insert("users", newUser as unknown as Record<string, unknown>);
  return { userId, name: `缘主${guestNumber}` };
}

/** 从请求头获取访客身份 */
export function getGuestHeader(request: Request): { id: string; number: number } | null {
  const id = request.headers.get("x-guest-id");
  const num = request.headers.get("x-guest-number");
  if (!id || !num) return null;
  return { id, number: parseInt(num) };
}
