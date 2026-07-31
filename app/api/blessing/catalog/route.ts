import { NextResponse } from "next/server";

const CATALOG = [
  { id: "health", label: "健康平安", icon: "💚", desc: "愿家人身体健康，平安顺遂" },
  { id: "career", label: "事业顺利", icon: "💼", desc: "愿工作顺遂，步步高升" },
  { id: "wealth", label: "财源广进", icon: "💰", desc: "愿财运亨通，富贵吉祥" },
  { id: "study", label: "学业有成", icon: "📚", desc: "愿金榜题名，学业进步" },
  { id: "love", label: "姻缘美满", icon: "💕", desc: "愿良缘天成，白头偕老" },
  { id: "family", label: "家庭和睦", icon: "🏠", desc: "愿合家欢乐，幸福安康" },
];

export async function GET() {
  return NextResponse.json({ catalog: CATALOG });
}
