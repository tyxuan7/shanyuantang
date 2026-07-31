import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { now, insert, sql, LotteryRow } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

const POEMS: Record<number, { title: string; poem: string }> = {
  1: { title: "第一签 · 上上签", poem: "龙腾云汉开金阙，凤绕琼林护玉宸。\n万国梯航归寿域，一天星斗照儒绅。\n春回禹甸山河晓，日转尧天草木新。\n圣寿无疆天地久，皇图永固万年珍。" },
  2: { title: "第二签 · 上吉签", poem: "沧海桑田几变更，蟠桃又熟荐瑶京。\n云中鸾凤衔仙诏，海上神仙识姓名。\n六合清宁开泰运，八荒熙皞乐升平。\n从今大展经纶手，华夏长流雅颂声。" },
  3: { title: "第三签 · 中平签", poem: "花落花开自有时，莫因风雨怨春迟。\n守得云开见月明，静待时机展新枝。\n一樽且向花前醉，万事都从命里推。\n但把心田勤灌溉，何愁岁晚不收宜。" },
};

const MASTERS: Record<string, { name: string; style: Record<number, string> }> = {
  huiming: {
    name: "慧明长老",
    style: {
      1: "老衲观此签，乃大吉之兆。佛光普照，善缘具足。施主所求之事，皆有天龙护法暗中庇佑。但切记：福报虽大，不可骄慢，当以慈悲心广结善缘。阿弥陀佛。",
      2: "此签上吉，老衲看来，施主福缘深厚，只待东风。但修行路上不可急进，一步一脚印，自有水到渠成之日。善哉善哉。",
      3: "花开花落，皆是因果。老衲劝施主：莫因一时不顺而灰心，守得云开见月明。静心持戒，福田自种。阿弥陀佛。",
    }
  },
  mingxin: {
    name: "明心师父",
    style: {
      1: "明心见性，此签大吉。施主心念纯正，感得诸佛加持。所求之事皆可成就，但要以平常心对待，方能长久。心中有佛，处处是净土。",
      2: "好签！施主善根深厚，明心看来，此事虽有小小波折，但终得圆满。记住：心宽一寸，路宽一丈。南无阿弥陀佛。",
      3: "施主莫急，明心为你参详：此签虽为中平，却是上天给你磨练心性的机会。逆境中修忍辱，顺境中修布施。一切都会好起来的。",
    }
  },
  xuanzhen: {
    name: "玄真道长",
    style: {
      1: "贫道观之，此签上上大吉！天地人三才得位，卦象通达。施主所求，如顺水行舟，自然成就。但道家讲究阴阳平衡，得意时莫忘谦逊。无量天尊。",
      2: "好签！贫道细参卦象，施主运势正处上升之势。虽有小人作祟，但正气内存，邪不可干。记得：道法自然，顺势而为。福生无量。",
      3: "施主且听贫道一言：此签中平，并非坏事。正如太极图中阴阳互转，低谷之后便是高峰。守住本心，静待天时。大道至简，顺其自然。",
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const { master } = await request.json();
    const masterKey = master && MASTERS[master] ? master : "huiming";
    const masterInfo = MASTERS[masterKey];

    const lotNumber = Math.floor(Math.random() * 3) + 1;
    const poem = POEMS[lotNumber];
    const interpretation = masterInfo.style[lotNumber];

    // 获取用户（通过 guest header 或 JWT）
    let userId: string | null = null;
    const guestNum = request.headers.get("x-guest-number");
    if (guestNum) {
      const rows = await sql<RowDataPacket & { id: string }>(
        "SELECT id FROM users WHERE guest_number = ?", [parseInt(guestNum)]
      );
      if (rows[0]) userId = rows[0].id;
    }

    const record: LotteryRow & { master?: string } = {
      id: uuidv4(),
      user_id: userId,
      lot_number: lotNumber,
      poem: poem.poem,
      interpretation,
      master: masterInfo.name,
      created_at: now(),
    };
    await insert("lottery_records", record as unknown as Record<string, unknown>);

    return NextResponse.json({
      lot: {
        number: lotNumber,
        title: poem.title,
        poem: poem.poem,
        interpretation,
        master: masterInfo.name,
      },
      record,
    });
  } catch (e) { console.error(e); return NextResponse.json({ error: "求签失败" }, { status: 500 }); }
}
