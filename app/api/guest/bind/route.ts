import { NextRequest, NextResponse } from "next/server";
import { bindPhone } from "@/lib/guest";

export async function POST(request: NextRequest) {
  const { guestNumber, phone } = await request.json();
  if (!guestNumber || !phone) {
    return NextResponse.json({ error: "请提供 guestNumber 和 phone" }, { status: 400 });
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "请输入正确的手机号" }, { status: 400 });
  }
  const result = await bindPhone(guestNumber, phone);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json(result);
}
