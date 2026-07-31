/**
 * 善缘堂 — 数据库层 (MySQL 8.0 via mysql2)
 *
 * 连接池 + 辅助查询方法，与原 JSON 接口兼容。
 * 数据持久化在 MySQL putiyuan 数据库。
 */

import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";

/** 本地时间字符串 (YYYY-MM-DD HH:MM:SS) */
export function now(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

// 优先使用 DATABASE_URL（PlanetScale/Vercel），否则用本地 MySQL
const pool: Pool = (() => {
  if (process.env.DATABASE_URL) {
    return mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
      dateStrings: true,
      ssl: { rejectUnauthorized: false },
    });
  }
  const isTiDB = (process.env.DB_HOST || "").includes("tidbcloud.com");
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "putiyuan",
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
    dateStrings: true,
    ...(isTiDB ? { ssl: { rejectUnauthorized: false } } : {}),
  });
})();

// ============ 底层 SQL 方法 ============

/** 执行任意 SQL 查询 */
export async function sql<T extends RowDataPacket>(
  query: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<T[]>(query, params as any[]);
    return rows;
  } finally {
    conn.release();
  }
}

/** 执行 INSERT/UPDATE/DELETE */
export async function execute(
  query: string,
  params?: (string | number | boolean | null)[]
): Promise<ResultSetHeader> {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute<ResultSetHeader>(query, params as any[]);
    return result;
  } finally {
    conn.release();
  }
}

/** 查询单行 */
export async function sqlOne<T extends RowDataPacket>(
  query: string,
  params?: any[]
): Promise<T | null> {
  const rows = await sql<T>(query, params);
  return rows[0] || null;
}

/** 获取连接池（高级操作用） */
export function getPool(): Pool {
  return pool;
}

// ============ 兼容旧 JSON API ============
// 以下保持与原接口兼容，内部转 SQL

type TableName =
  | "users"
  | "blessings"
  | "lottery_records"
  | "orders"
  | "divination_results"
  | "palm_records"
  | "face_records"
  | "naming_records"
  | "dream_records"
  | "bazi_records";

const TABLE_MAP: Record<string, string> = {
  users: "users",
  blessings: "blessings",
  lottery_records: "lottery_records",
  orders: "orders",
  divination_results: "divination_results",
  palm_records: "palm_records",
  face_records: "face_records",
  naming_records: "naming_records",
  dream_records: "dream_records",
  bazi_records: "bazi_records",
};

/** 查询全表数据 */
export async function queryAll<T>(table: TableName, filter?: (row: T) => boolean): Promise<T[]> {
  const tableName = TABLE_MAP[table] || table;
  const rows = await sql<RowDataPacket>(`SELECT * FROM \`${tableName}\``);
  const result = rows as unknown as T[];
  if (!filter) return result;
  return result.filter(filter);
}

/** 查询单行 */
export async function queryOne<T>(table: TableName, filter: (row: T) => boolean): Promise<T | null> {
  const rows = await queryAll<T>(table);
  return rows.find(filter) || null;
}

/** 插入一行 */
export async function insert(table: TableName, row: Record<string, unknown>): Promise<void> {
  const tableName = TABLE_MAP[table] || table;
  const keys = Object.keys(row);
  const values = Object.values(row) as any[];
  const placeholders = keys.map(() => "?").join(", ");
  const cols = keys.map(k => `\`${k}\``).join(", ");

  await execute(
    `INSERT INTO \`${tableName}\` (${cols}) VALUES (${placeholders})`,
    values
  );
}

/** 按条件更新 */
export async function update(
  table: TableName,
  filter: (row: Record<string, unknown>) => boolean,
  updates: Record<string, unknown>
): Promise<number> {
  const tableName = (TABLE_MAP[table] || table) as TableName;
  const all = await queryAll<Record<string, unknown>>(tableName);
  const matched = all.filter(filter);

  if (matched.length === 0) return 0;

  const setClauses = Object.keys(updates)
    .map(k => `\`${k}\` = ?`)
    .join(", ");
  const setValues = Object.values(updates) as any[];

  for (const row of matched) {
    await execute(
      `UPDATE \`${tableName}\` SET ${setClauses} WHERE id = ?`,
      [...setValues, row.id]
    );
  }

  return matched.length;
}

/** 按条件删除 */
export async function remove(
  table: TableName,
  filter: (row: Record<string, unknown>) => boolean
): Promise<number> {
  const tableName = (TABLE_MAP[table] || table) as TableName;
  const all = await queryAll<Record<string, unknown>>(tableName);
  const matched = all.filter(filter);

  if (matched.length === 0) return 0;

  const ids = matched.map(r => r.id) as any[];
  const placeholders = ids.map(() => "?").join(", ");
  await execute(
    `DELETE FROM \`${tableName}\` WHERE id IN (${placeholders})`,
    ids
  );

  return matched.length;
}

/** 计数 */
export async function getCount(
  table: TableName,
  filter?: (row: Record<string, unknown>) => boolean
): Promise<number> {
  if (!filter) {
    const tableName = TABLE_MAP[table] || table;
    const rows = await sql<RowDataPacket & { c: number }>(
      `SELECT COUNT(*) as c FROM \`${tableName}\``
    );
    return rows[0]?.c || 0;
  }
  const rows = await queryAll<Record<string, unknown>>(table, filter);
  return rows.length;
}

// ============ 旧接口类型导出（保持兼容） ============

export interface UserRow {
  id: string; username: string; password_hash: string; nickname: string;
  avatar: string; phone: string; role: string; permission: number; balance: number;
  guest_number: number; created_at: string;
}
export interface BlessingRow {
  id: string; user_id: string | null; pilgrim_name: string;
  blessing_type: string; blessing_text: string; created_at: string;
}
export interface LotteryRow {
  id: string; user_id: string | null; lot_number: number;
  poem: string; interpretation: string; master: string; created_at: string;
}
export interface OrderRow {
  id: string; user_id: string | null; product_type: string;
  product_name: string; amount: number; status: string;
  payee_name: string; result: string; created_at: string; paid_at: string | null;
}
export interface DivinationRow {
  id: string; user_id: string | null; div_type: string;
  input_data: string; result_text: string; created_at: string;
}
export interface PalmRow {
  id: string; user_id: string | null; image_note: string;
  result_text: string; created_at: string;
}
export interface FaceRow {
  id: string; user_id: string | null; image_note: string;
  result_text: string; created_at: string;
}
export interface NamingRow {
  id: string; user_id: string | null; surname: string; gender: string;
  birth_date: string; style: string; result_text: string; created_at: string;
}
export interface DreamRow {
  id: string; user_id: string | null; dream_text: string;
  result_text: string; created_at: string;
}
export interface BaziRow {
  id: string; user_id: string | null; name: string; gender: string;
  birth_date: string; birth_hour: string; result_text: string; created_at: string;
}
