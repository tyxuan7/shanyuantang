import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { now, insert, DreamRow } from "@/lib/db";
import { extractToken, getUserFromToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { dream_text, result_text } = await request.json();
    const token = extractToken(request);
    const user = token ? await getUserFromToken(token) : null;
    const row: DreamRow = { id: uuidv4(), user_id: user?.id || null, dream_text: dream_text || "", result_text: result_text || "", created_at: now() };
    await insert("dream_records", row as unknown as Record<string, unknown>);
    return NextResponse.json({ success: true, id: row.id });
  } catch (e) { console.error(e); return NextResponse.json({ error: "保存失败" }, { status: 500 }); }
}
