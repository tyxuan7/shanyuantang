"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";

const MASTERS = [
  { id: "huiming", name: "慧明长老", title: "佛门高僧", icon: "🪷", desc: "以佛法智慧开示，慈悲为怀，引经据典" },
  { id: "mingxin", name: "明心师父", title: "禅宗大德", icon: "☸", desc: "明心见性，直指人心，一语道破玄机" },
  { id: "xuanzhen", name: "玄真道长", title: "道门真人", icon: "☯", desc: "道法自然，顺势而为，以卦参透天机" },
];

interface LotResult {
  number: number; title: string; poem: string; interpretation: string; master: string;
}

export default function LotteryPage() {
  const [step, setStep] = useState<"select"|"shaking"|"result">("select");
  const [lotResult, setLotResult] = useState<LotResult | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSelectMaster = (masterId: string) => {
    setStep("shaking");
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setShakeCount(count);
      if (count >= 8) {
        clearInterval(interval);
        drawLot(masterId);
      }
    }, 400);
  };

  const drawLot = async (masterId: string) => {
    setLoading(true);
    try {
      const hdr: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("putiyuan_guest");
        if (raw) {
          const g = JSON.parse(raw);
          hdr["x-guest-id"] = g.id;
          hdr["x-guest-number"] = String(g.number);
        }
      }
      const res = await fetch("/api/lottery/draw", {
        method: "POST", headers: hdr,
        body: JSON.stringify({ master: masterId }),
      });
      const data = await res.json();
      setLotResult(data.lot);
    } catch {
      const m = MASTERS.find(x => x.id === masterId)!;
      setLotResult({
        number: 1,
        title: "第一签 · 上上签",
        poem: "龙腾云汉开金阙，凤绕琼林护玉宸。\n万国梯航归寿域，一天星斗照儒绅。",
        interpretation: "大吉之签。施主心诚，关帝感应，所求之事皆得庇佑。但需持平常心，莫生骄慢。",
        master: m.name,
      });
    }
    setShakeCount(99);
    setLoading(false);
    setStep("result");
  };

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📜" title="关帝灵签" subtitle="心诚则灵 · 请一位师父为您开示" />

      <div className="mx-auto max-w-lg">
        {/* 选择师父 — 直接展示 */}
        {step === "select" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 shadow-gold text-center">
              <p className="text-sm text-paper-dark leading-relaxed">
                请先静心默念心中所求之事<br />
                然后选择一位师父为您求签开示
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MASTERS.map(m => (
                <button key={m.id} onClick={() => handleSelectMaster(m.id)}
                  className="w-full rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 text-center shadow-gold hover:border-gold/50 hover:shadow-gold hover:scale-[1.02] transition-all group">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gold-glow flex items-center justify-center text-3xl group-hover:animate-pulse-gold">
                      {m.icon}
                    </div>
                    <div>
                      <h3 className="text-lg text-paper font-semibold">{m.name}</h3>
                      <span className="text-xs text-paper-muted bg-gold/10 px-2 py-0.5 rounded-full mt-1 inline-block">{m.title}</span>
                    </div>
                    <p className="text-sm text-paper-muted leading-relaxed">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-4 shadow-gold">
              <h3 className="text-sm text-gold mb-2">⚠️ 求签须知</h3>
              <ul className="text-xs text-paper-muted space-y-1.5 list-disc list-inside">
                <li>一日之内同一事不可反复求签</li>
                <li>心不诚则签不灵，务必静心凝神</li>
                <li>签文仅供指引参考，命运掌握在自己手中</li>
              </ul>
            </div>
          </div>
        )}

        {/* 摇签动画 */}
        {step === "shaking" && (
          <div className="flex flex-col items-center py-12">
            <p className="text-sm text-gold mb-4" style={{ fontFamily: "var(--font-calligraphy)" }}>
              诚心感应中...
            </p>
            <div className={`relative w-24 h-40 rounded-2xl border-2 border-gold/30 bg-xuan-card/95 flex items-center justify-center mb-6 ${shakeCount < 8 ? "animate-[wiggle_0.15s_ease-in-out_infinite]" : ""}`}>
              <div className="flex flex-col items-center gap-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`w-12 h-2 rounded-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-300 ${
                    shakeCount >= 8 ? (shakeCount === 99 && i === 2 ? "-translate-y-5 opacity-100" : "opacity-40") : shakeCount % 2 === 0 ? "translate-x-2" : "-translate-x-2"
                  }`} />
                ))}
              </div>
            </div>
            {loading && <LoadingSpinner text="签已落定，师父正在解读..." />}
            {!loading && shakeCount < 8 && <p className="text-sm text-paper-dark animate-pulse-gold">正在摇签中...</p>}
          </div>
        )}

        {/* 结果 */}
        {step === "result" && lotResult && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-xl border border-gold/30 bg-xuan-card/95 p-4 text-center shadow-gold">
              <p className="text-xs text-paper-muted">为您开示的师父</p>
              <p className="text-base text-gold font-semibold">{lotResult.master}</p>
            </div>

            <div className="rounded-xl border border-gold/30 bg-xuan-card/95 p-6 text-center shadow-gold">
              <div className="w-16 h-16 mx-auto rounded-full bg-gold-glow flex items-center justify-center mb-3 animate-pulse-gold">
                <span className="text-2xl text-gold font-bold">{lotResult.number}</span>
              </div>
              <h3 className="text-lg text-gradient-gold font-medium">{lotResult.title}</h3>
              <p className="text-sm text-paper-dark leading-relaxed mt-3 whitespace-pre-line">{lotResult.poem}</p>
            </div>

            <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 shadow-gold">
              <h4 className="text-sm text-gold mb-3">🔮 {lotResult.master}开示</h4>
              <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap">{lotResult.interpretation}</p>
            </div>

            <button onClick={() => { setStep("select"); setLotResult(null); }}
              className="w-full py-3 rounded-lg border border-gold-subtle text-paper-dark text-sm hover:text-gold transition-colors">
              重新求签
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
