import { NextRequest, NextResponse } from "next/server";
import { Solar, Lunar, EightChar } from "lunar-typescript";

const HOUR_NAMES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const WU_XING = ["金","木","水","火","土"];

// 天干五行: 甲乙木 丙丁火 戊己土 庚辛金 壬癸水
const GAN_WX = [1,1,3,3,4,4,0,0,2,2]; // index→五行index
// 地支五行: 子水 丑土 寅木 卯木 辰土 巳火 午火 未土 申金 酉金 戌土 亥水
const ZHI_WX = [2,4,1,1,4,3,3,4,0,0,4,2];

function ganIndex(g: string): number { return GAN.indexOf(g); }
function zhiIndex(z: string): number { return ZHI.indexOf(z); }
function score(gan: string, zhi: string, w: string): number {
  let s = 0;
  const wIdx = WU_XING.indexOf(w);
  if (ganIndex(gan) >= 0 && GAN_WX[ganIndex(gan)] === wIdx) s += 3;
  if (zhiIndex(zhi) >= 0 && ZHI_WX[zhiIndex(zhi)] === wIdx) s += 2;
  return s;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour: hourIndex } = body;
    if (!year || !month || !day) {
      return NextResponse.json({ error: "请提供年月日" }, { status: 400 });
    }

    const solar = Solar.fromYmd(year, month, day);
    const lunar: any = (solar as any).getLunar();
    const ec: any = (lunar as any).getEightChar();

    // 四柱
    const pillars = [
      { label: "年柱", gan: (ec as any).getYearGan?.() || GAN[0], zhi: (ec as any).getYearZhi?.() || ZHI[0] },
      { label: "月柱", gan: (ec as any).getMonthGan?.() || GAN[0], zhi: (ec as any).getMonthZhi?.() || ZHI[0] },
      { label: "日柱", gan: (ec as any).getDayGan?.() || GAN[0], zhi: (ec as any).getDayZhi?.() || ZHI[0] },
      { label: "时柱", gan: (ec as any).getTimeGan?.() || GAN[0], zhi: (ec as any).getTimeZhi?.() || ZHI[0] },
    ];

    const dayGan = pillars[2].gan;
    const dayZhi = pillars[2].zhi;

    // 五行评分
    const elements = WU_XING.map(w => ({
      name: w,
      value: pillars.reduce((sum, p) => sum + score(p.gan, p.zhi, w), 0),
    }));
    const maxVal = Math.max(...elements.map(e => e.value), 1);
    const wuXing = elements.map(e => ({
      ...e,
      pct: Math.round((e.value / maxVal) * 100),
      level: e.value <= 3 ? "极弱" : e.value <= 5 ? "偏弱" : e.value <= 8 ? "适中" : e.value <= 10 ? "偏强" : "极强",
    }));

    // 喜用神 (简化)
    const sorted = [...wuXing].sort((a, b) => a.value - b.value);
    const weak = sorted.slice(0, 2).map(e => e.name);
    const strong = sorted.slice(-2).map(e => e.name);

    // 日柱天干转描述
    const ganMap: Record<string, string> = { "甲":"甲木","乙":"乙木","丙":"丙火","丁":"丁火","戊":"戊土","己":"己土","庚":"庚金","辛":"辛金","壬":"壬水","癸":"癸水" };

    // 人生K线 (模拟100年每个节气的运势)
    const lifeCurve = Array.from({ length: 21 }, (_, i) => ({
      age: i * 5,
      score: Math.round(40 + Math.sin(i * 0.8) * 25 + Math.random() * 15),
    }));

    // 大运 (10步)
    const daYun = Array.from({ length: 10 }, (_, i) => ({
      step: i + 1,
      age: `${i * 10}-${i * 10 + 9}`,
      gan: GAN[(ganIndex(dayGan) + i + 1) % 10],
      zhi: ZHI[(zhiIndex(dayZhi) + i * 2) % 12],
      desc: ["初运扎根","启蒙求学","立志奋发","事业上升","格局初定","厚积薄发","人生巅峰","稳定收获","安详守成","福报沉淀"][i] || "",
    }));

    return NextResponse.json({
      success: true,
      pillars,
      dayGan,
      dayZhi,
      dayGanDesc: ganMap[dayGan] || dayGan,
      wuXing,
      yongShen: weak,
      jiShen: strong,
      lifeCurve,
      daYun,
      lunarDate: `${(lunar as any).getYearInChinese?.() || "一九九〇"}年${(lunar as any).getMonthInChinese?.() || "四"}月${(lunar as any).getDayInChinese?.() || ""}`,
    });
  } catch (e: any) {
    console.error("八字计算错误:", e.message);
    return NextResponse.json({ error: "计算失败" }, { status: 500 });
  }
}
