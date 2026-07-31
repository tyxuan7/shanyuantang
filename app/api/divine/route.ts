import { NextRequest, NextResponse } from "next/server";
import { divineFortune } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "请提供 type 和 data 参数" },
        { status: 400 }
      );
    }

    const validTypes = [
      "bazi",
      "lottery",
      "dream",
      "palm",
      "face",
      "naming",
      "blessing",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `无效的 type，支持的类型：${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await divineFortune({ type, data });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("命理 API 错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后再试" },
      { status: 500 }
    );
  }
}
