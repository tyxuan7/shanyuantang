import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { now, queryOne, insert, UserRow } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "putiyuan-dev-secret-change-in-production";
const TOKEN_EXPIRY = "7d";

export interface UserSafe {
  id: string; username: string; nickname: string; avatar: string;
  role: string; permission: number; balance: number; created_at: string;
}

function toSafeUser(u: UserRow): UserSafe {
  return { id: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: u.role, permission: u.permission, balance: u.balance, created_at: u.created_at };
}

export async function registerUser(username: string, password: string): Promise<{ user: UserSafe; token: string } | { error: string }> {
  const existing = await queryOne<UserRow>("users", (u) => u.username === username);
  if (existing) return { error: "用户名已存在" };
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const nowTs = now();
  const newUser: UserRow = { id, username, password_hash: passwordHash, nickname: username, avatar: "", phone: "", role: "user", permission: 1, balance: 0, guest_number: 0, created_at: nowTs };
  await insert("users", newUser as unknown as Record<string, unknown>);
  const token = jwt.sign({ userId: id, role: "user" }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return { user: toSafeUser(newUser), token };
}

export async function loginUser(username: string, password: string): Promise<{ user: UserSafe; token: string } | { error: string }> {
  const user = await queryOne<UserRow>("users", (u) => u.username === username);
  if (!user) return { error: "用户名或密码错误" };
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return { error: "用户名或密码错误" };
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return { user: toSafeUser(user), token };
}

export async function getUserFromToken(token: string): Promise<UserSafe | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    const user = await queryOne<UserRow>("users", (u) => u.id === payload.userId);
    return user ? toSafeUser(user) : null;
  } catch { return null; }
}

export function extractToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

export async function requireAdmin(request: Request): Promise<{ user: UserSafe } | { error: string; status: number }> {
  const token = extractToken(request);
  if (!token) return { error: "未登录", status: 401 };
  const user = await getUserFromToken(token);
  if (!user) return { error: "登录已过期", status: 401 };
  if (user.role !== "admin") return { error: "无权限", status: 403 };
  return { user };
}
