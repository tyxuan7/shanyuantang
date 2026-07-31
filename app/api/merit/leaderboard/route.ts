import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  // 排行榜
  const rows = await sql<RowDataPacket & { nickname: string; total_merit: number; guest_number: number }>(
    "SELECT nickname, total_merit, guest_number FROM users WHERE total_merit > 0 ORDER BY total_merit DESC LIMIT ?",
    [limit]
  );

  const total = await sql<RowDataPacket & { c: number }>(
    "SELECT COUNT(*) as c FROM users WHERE total_merit > 0"
  );

  // 获取当前用户排名
  let myRank = 0;
  const guestNum = request.headers.get("x-guest-number");
  if (guestNum) {
    const user = await sql<RowDataPacket & { total_merit: number }>(
      "SELECT total_merit FROM users WHERE guest_number = ?", [parseInt(guestNum)]
    );
    if (user[0]?.total_merit > 0) {
      const rank = await sql<RowDataPacket & { r: number }>(
        "SELECT COUNT(*) as r FROM users WHERE total_merit > ?", [user[0].total_merit]
      );
      myRank = (rank[0]?.r || 0) + 1;
    }
  }

  // 脱敏名称 + 称号
  const board = rows.map((r, i) => ({
    rank: i + 1,
    name: maskName(r.nickname || `缘主${r.guest_number}`),
    merit: r.total_merit,
    title: r.total_merit >= 100 ? "居士" : "善信",
  }));

  return NextResponse.json({ board, total: total[0]?.c || 0, myRank });
}

function maskName(n: string): string {
  if (n.length <= 1) return n + "***";
  return n.slice(0, 1) + "***" + n.slice(-1);
}
