"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";

interface AlmanacData {
  solar: string;
  lunar: string;
  year_ganzhi: string;
  month_ganzhi: string;
  day_ganzhi: string;
  wuxing: string;
  chong: string;
  yi: string[];
  ji: string[];
  jishen: string[];
  xiongshen: string[];
}

// 简易黄历生成（基于日期推算）
function generateAlmanac(): AlmanacData {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);

  const tiangan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const dizhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const shengxiao = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
  const wuxingList = ["金","木","水","火","土"];
  const lunarMonths = ["正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"];
  const lunarDays = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

  const yearGz = tiangan[(now.getFullYear() - 4) % 10] + dizhi[(now.getFullYear() - 4) % 12];
  const monthIdx = now.getMonth();
  const dayIdx = (dayOfYear + 8) % 60;
  const dayGz = tiangan[dayIdx % 10] + dizhi[dayIdx % 12];

  const yiPool = ["祭祀","祈福","求嗣","开光","出行","嫁娶","入宅","安床","开业","交易","纳财","栽种","修造","动土","上梁","竖柱","安门","作灶"];
  const jiPool = ["安葬","伐木","作梁","纳畜","破土","开市","立券","纳采","订盟","搬家","移徙","出火","入殓","移柩","启攒"];

  // 用日期做伪随机
  const seed = dayOfYear * 7 + now.getFullYear() * 3;
  const pick = (arr: string[], count: number) => {
    const result: string[] = [];
    const copy = [...arr];
    for (let i = 0; i < count; i++) {
      const idx = (seed + i * 13 + now.getMonth() * 17) % copy.length;
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  };

  return {
    solar: `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 星期${["日","一","二","三","四","五","六"][now.getDay()]}`,
    lunar: `${yearGz}年 ${lunarMonths[(now.getMonth()+1)%12]}${lunarDays[(now.getDate()-1+15)%30]}`,
    year_ganzhi: yearGz,
    month_ganzhi: tiangan[(now.getFullYear()*12+monthIdx+2)%10] + dizhi[(monthIdx+2)%12],
    day_ganzhi: dayGz,
    wuxing: wuxingList[dayIdx % 5],
    chong: shengxiao[(dizhi.indexOf(dayGz[1]) + 6) % 12],
    yi: pick(yiPool, 4),
    ji: pick(jiPool, 3),
    jishen: ["天德","月德","天喜","福星"].sort(() => (seed%2)-0.5).slice(0,2),
    xiongshen: ["白虎","天牢"].sort(() => (seed%2)-0.5).slice(0,1),
  };
}

export default function AlmanacPage() {
  const [almanac, setAlmanac] = useState<AlmanacData | null>(null);

  useEffect(() => {
    setAlmanac(generateAlmanac());
  }, []);

  if (!almanac) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📅" title="今日黄历" subtitle="每日宜忌，择吉而行" />

      <div className="mx-auto max-w-lg space-y-4">
        {/* 日期信息 */}
        <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 md:p-6 shadow-gold text-center">
          <p className="text-xs text-paper-muted mb-1">{almanac.solar}</p>
          <h2 className="text-2xl text-gradient-gold mb-3"
            style={{ fontFamily: "var(--font-calligraphy)" }}>
            {almanac.lunar}
          </h2>

          {/* 干支信息 */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-xuan rounded-lg py-2">
              <p className="text-[11px] text-paper-muted">年柱</p>
              <p className="text-gold font-semibold">{almanac.year_ganzhi}</p>
            </div>
            <div className="bg-xuan rounded-lg py-2">
              <p className="text-[11px] text-paper-muted">月柱</p>
              <p className="text-gold font-semibold">{almanac.month_ganzhi}</p>
            </div>
            <div className="bg-xuan rounded-lg py-2">
              <p className="text-[11px] text-paper-muted">日柱</p>
              <p className="text-gold font-semibold">{almanac.day_ganzhi}</p>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-3 text-xs">
            <span className="text-paper-muted">五行：<span className="text-paper-dark">{almanac.wuxing}</span></span>
            <span className="text-paper-muted">冲煞：<span className="text-vermillion">{almanac.chong}</span></span>
          </div>
        </div>

        {/* 宜忌 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 宜 */}
          <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-4 shadow-gold">
            <h3 className="text-sm text-green-400 font-semibold mb-3">✅ 宜</h3>
            <div className="flex flex-wrap gap-1.5">
              {almanac.yi.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* 忌 */}
          <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-4 shadow-gold">
            <h3 className="text-sm text-vermillion font-semibold mb-3">❌ 忌</h3>
            <div className="flex flex-wrap gap-1.5">
              {almanac.ji.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-vermillion/10 border border-vermillion/20 text-xs text-vermillion">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 吉神凶神 */}
        <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-4 shadow-gold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-paper-muted mb-1">吉神</p>
              {almanac.jishen.map((s, i) => (
                <span key={i} className="text-sm text-gold">{s}{i < almanac.jishen.length-1 ? " · " : ""}</span>
              ))}
            </div>
            <div>
              <p className="text-xs text-paper-muted mb-1">凶神</p>
              {almanac.xiongshen.map((s, i) => (
                <span key={i} className="text-sm text-vermillion/70">{s}{i < almanac.xiongshen.length-1 ? " · " : ""}</span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-paper-muted opacity-50">
          黄历信息由算法生成，仅供生活参考
        </p>
      </div>
    </div>
  );
}
