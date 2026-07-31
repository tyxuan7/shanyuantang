"use client";

import { useState, useEffect } from "react";
import LampSvg from "./LampSvg";
import PayModal from "@/components/PayModal";

const LAMP_TYPES = [
  { id: "qingxin", name: "清心灯", color: "#7A6A4A", desc: "祈愿身心安宁、烦恼消解", price: 3.9 },
  { id: "zhihui", name: "智慧灯", color: "#7A6A4A", desc: "祈愿学业精进、心智明朗", price: 3.9 },
  { id: "changshou", name: "长寿灯", color: "#7A6A4A", desc: "祈愿身体康健、福寿绵长", price: 3.9 },
  { id: "pingan", name: "平安灯", color: "#C43D3D", desc: "祈愿出入平安、家宅安宁", price: 3.9 },
  { id: "yinyuan", name: "姻缘灯", color: "#7A6A4A", desc: "祈愿良缘早至、感情和顺", price: 3.9 },
  { id: "caifu", name: "财福灯", color: "#7A6A4A", desc: "祈愿财源广进、生意顺遂", price: 3.9 },
];

const DURATIONS = [
  { id: "month", label: "一月供奉", price: 3.9 },
  { id: "100days", label: "百日供奉", price: 5.9 },
  { id: "year", label: "一年供奉", price: 9.9 },
  { id: "forever", label: "永久长明", price: 19.9 },
];

const RELATIONS = ["父亲","母亲","爱人","孩子","孙辈","朋友","自己"];

export default function BlessingPage() {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("父亲");
  const [lampType, setLampType] = useState(LAMP_TYPES[3]); // 默认平安灯
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [wish, setWish] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [loading, setLoading] = useState(false);
  const [lit, setLit] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [wall, setWall] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    fetch("/api/blessing/wall?limit=12").then(r => r.json()).then(d => {
      if (d.items) {
        setWall(d.items);
        setTotalCount(d.total || d.items.length);
        const today = new Date().toISOString().slice(0,10);
        setTodayCount(d.items.filter((b: any) => b.created_at?.startsWith(today)).length);
      }
    }).catch(()=>{});
  }, [lit]);

  const handleLight = async () => {
    setLoading(true);
    const hdr: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("putiyuan_guest");
      if (raw) { const g = JSON.parse(raw); hdr["x-guest-id"]=g.id; hdr["x-guest-number"]=String(g.number); }
    }
    const text = wish || `${lampType.name} · 为${name}（${relation}）祈愿`;
    await fetch("/api/blessing/create", {
      method: "POST", headers: hdr,
      body: JSON.stringify({
        blessing_type: `${lampType.id}|${lampType.name}`,
        pilgrim_name: sponsor || "善信",
        duration: duration.id,
        blessing_text: `为${name}（${relation}）点亮${lampType.name} · ${duration.label} · ${text}`,
      }),
    });
    setLoading(false);
    setLit(true);
  };

  const reset = () => { setName(""); setWish(""); setSponsor(""); setLit(false); setLampType(LAMP_TYPES[3]); setDuration(DURATIONS[0]); };

  const inputClass = "h-10 rounded-md border border-gold/20 bg-xuan-surface px-3 text-paper-dark placeholder:text-ink-muted transition-all focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 text-lg w-full";

  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 pb-24">
      {/* Hero */}
      <section className="space-y-3 pt-8 text-center">
        <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-full border border-vermillion/30 bg-vermillion/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-10 text-vermillion">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
            </svg>
        </div>
        <h1 className="text-4xl tracking-widest text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>心愿供灯</h1>
        <p className="mx-auto max-w-md text-base text-paper-dark/85">点一盏灯，写下一份祝愿，留给家人、自己或重要时刻一份温和的仪式感。</p>

        {/* 统计条 */}
        <div className="mx-auto inline-flex items-center gap-4 rounded-full border border-gold/30 bg-xuan-card/70 px-6 py-2 text-sm text-paper-dark/85">
          <span>已点亮 <span className="font-display text-lg text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{totalCount}</span> 盏</span>
          <span className="h-4 w-px bg-gold/30"/>
          <span>今日新增 <span className="font-display text-lg text-vermillion" style={{fontFamily:"var(--font-calligraphy)"}}>{todayCount}</span> 盏</span>
        </div>

        {/* 滚动条 */}
        <div className="relative mx-auto mt-3 max-w-lg overflow-hidden rounded-full border border-gold/20 bg-xuan-card/50 px-4 py-2">
          <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-8">
            {wall.slice(0,10).map((b: any, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs text-paper-dark/75">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-vermillion/70">
                  <path d="M12 2c.7 1.3 2.3 3 3.5 4.5A5 5 0 0 1 12 22a5 5 0 0 1-3.5-15.5C9.7 5 11.3 3.3 12 2z"/>
                </svg>
                <span className="text-gold/85">{b.pilgrim_name?.slice(0,1)}**</span>
                <span>点亮{b.blessing_type?.split('|')[1] || '平安灯'}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 点灯表单 */}
      {!lit ? (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-6">
          <h2 className="font-display text-2xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>为谁点灯</h2>

          {/* 姓名 + 关系 */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-base text-paper-dark/85">家人姓名</span>
              <input className={inputClass} placeholder="例如：王秀英" maxLength={16} value={name} onChange={e=>setName(e.target.value)}/>
            </label>
            <label className="space-y-2">
              <span className="text-base text-paper-dark/85">与您的关系</span>
              <select className="h-12 w-full rounded-md border border-gold/20 bg-xuan-surface px-3 text-lg text-paper-dark focus:border-gold focus:outline-none" value={relation} onChange={e=>setRelation(e.target.value)}>
                {RELATIONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>

          {/* 选灯 */}
          <div className="space-y-3">
            <p className="text-base text-paper-dark/85">选一盏灯</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {LAMP_TYPES.map(l=>(
                <button key={l.id} type="button" onClick={()=>setLampType(l)}
                  className={`group relative rounded-xl border p-4 text-left transition-all ${
                    lampType.id===l.id ? "border-gold/60 bg-gold/10 shadow-gold" : "border-gold/20 bg-xuan-surface/40 hover:border-gold/40"
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 size-7" style={{color: lampType.id===l.id && l.id==="pingan" ? "#C43D3D" : "#7A6A4A"}}>
                    <path d="M12 2c.7 1.3 2.3 3 3.5 4.5A5 5 0 0 1 12 22a5 5 0 0 1-3.5-15.5C9.7 5 11.3 3.3 12 2z"/>
                  </svg>
                  <p className="font-display text-lg text-paper-dark" style={{fontFamily:"var(--font-calligraphy)"}}>{l.name}</p>
                  <p className="mt-1 text-sm text-paper-dark/65">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 供奉时长 */}
          <div className="space-y-3">
            <p className="text-base text-paper-dark/85">供奉时长</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {DURATIONS.map(d=>(
                <button key={d.id} type="button" onClick={()=>setDuration(d)}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    duration.id===d.id ? "border-gold/60 bg-gold/10 shadow-gold" : "border-gold/20 bg-xuan-surface/40 hover:border-gold/40"
                  }`}>
                  <p className="font-display text-lg text-paper-dark" style={{fontFamily:"var(--font-calligraphy)"}}>{d.label}</p>
                  <p className="mt-1 font-number text-2xl text-vermillion">¥{d.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 心愿 */}
          <label className="block space-y-2">
            <span className="text-base text-paper-dark/85">心愿（可选，最多 80 字）</span>
            <textarea placeholder="例如：愿父亲身体康健、烦恼消解" maxLength={80} rows={3} value={wish} onChange={e=>setWish(e.target.value)}
              className="w-full rounded-md border border-gold/20 bg-xuan-surface px-4 py-3 text-base text-paper-dark focus:border-gold focus:outline-none"/>
          </label>

          {/* 称呼 */}
          <label className="block space-y-2">
            <span className="text-base text-paper-dark/85">敬奉人 / 您的称呼（可选，会显示在灯墙）</span>
            <input className={inputClass} placeholder="例如：李小华" maxLength={16} value={sponsor} onChange={e=>setSponsor(e.target.value)}/>
          </label>

          {/* 供灯预览 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-surface/40 p-5 text-center space-y-3">
            <h3 className="font-display text-lg text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>供灯预览</h3>
            <LampSvg lampType={lampType.id as any} color={lampType.id === "pingan" ? "#C43D3D" : "#7A6A4A"} name={name || "?"} blessing={lampType.name} size="lg" />
            <p className="text-base text-paper-dark">
              <span className="text-gold font-semibold">{sponsor || "善信"}</span>
              {" 为 "}<span className="text-gold font-semibold">{name || "?"}</span>{" 敬奉"}
            </p>
            <p className="text-sm text-paper-muted">{lampType.name} · {duration.label} · ¥{duration.price}</p>
          </div>

          {/* 价格 + 点灯按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-paper-dark/65">需供奉</p>
              <p className="font-display text-3xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>¥{duration.price}</p>
            </div>
            <button onClick={()=>setShowPay(true)} disabled={loading}
              className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light min-w-[180px] h-12 px-8 text-lg disabled:opacity-50">
              {loading ? "点灯中..." : "点亮此灯"}
            </button>
          </div>
        </div>
      ) : (
        /* 点灯成功 */
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gold-glow flex items-center justify-center animate-pulse-gold">
            <span className="text-3xl">🪔</span>
          </div>
          <h3 className="text-2xl text-gradient-gold" style={{fontFamily:"var(--font-calligraphy)"}}>心愿已点亮</h3>
          <p className="text-base text-paper-dark">{lampType.name} · {duration.label} · 为{name}（{relation}）</p>
          <p className="text-sm text-paper-muted">愿此灯长明，福泽绵长</p>
          <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gold/40 text-gold text-base hover:bg-gold/10 transition-all">再点一盏</button>
        </div>
      )}

      {showPay && <PayModal productName={`心愿供灯 · ${lampType.name} · ${duration.label}`} amount={Math.round(duration.price*100)}
        onSuccess={()=>{setShowPay(false);handleLight();}}
        onCancel={()=>setShowPay(false)}/>}

      {/* 心愿灯墙 */}
      <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-4">
        <h2 className="font-display text-2xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>心愿灯墙</h2>
        <p className="text-sm text-paper-dark/65">姓名已脱敏处理 · 仅作心愿展示</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {wall.map((b: any, i: number) => {
            const lampId = b.blessing_type?.split('|')[0] || 'pingan';
            const lampName = b.blessing_type?.split('|')[1] || '平安灯';
            const lampClr = LAMP_TYPES.find(l=>l.id===lampId)?.color || '#C43D3D';
            return (
              <div key={i} className="space-y-2">
                <LampSvg lampType={lampId as any} color={lampClr} name={b.pilgrim_name || "善信"} blessing={lampName}/>
                <p className="text-center text-xs text-paper-dark/65">
                  {b.pilgrim_name?.slice(0,1)}** 为 {b.blessing_text?.match(/为(.+?)（/)?.[1]?.slice(0,1) || "亲"}** 敬奉
                </p>
              </div>
            );
          })}
          {wall.length === 0 && <p className="col-span-full text-center text-paper-muted text-sm py-8">还没有人点灯，来做第一个点灯人吧 🙏</p>}
        </div>
      </div>
    </div>
  );
}
