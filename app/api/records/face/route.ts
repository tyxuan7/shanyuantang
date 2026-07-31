import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sql, now } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    const { result_text } = await request.json();
    let userId: string | null = null;
    const gn = request.headers.get("x-guest-number");
    if (gn) { const r = await sql<RowDataPacket & { id: string }>("SELECT id FROM users WHERE guest_number=?",[+gn]); if (r[0]) userId = r[0].id; }
    const id = uuidv4();
    await sql("INSERT INTO face_records (id,user_id,image_note,result_text,created_at) VALUES (?,?,?,?,?)",
      [id, userId, "用户上传", result_text||"", now()]);
    return NextResponse.json({ success: true, id });
  } catch (e) { console.error(e); return NextResponse.json({ error:"保存失败" },{status:500}); }
}
