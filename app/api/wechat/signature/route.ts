import { NextRequest, NextResponse } from "next/server";
import { generateSignature } from "@/lib/wechat";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });

    const sig = await generateSignature(url);
    return NextResponse.json(sig);
  } catch (e: any) {
    console.error("微信签名错误:", e);
    return NextResponse.json({ error: e.message || "签名失败" }, { status: 500 });
  }
}
