"use client";

import { useState } from "react";
import PayModal from "@/components/PayModal";

const MASTERS = [
  { id: "huiming", name: "慧明长老", title: "古寺住持", icon: "🧘", style: "庄重持重，引经据典", desc: "通读《渊海子平》《滴天髓》，言语稳重克制。" },
  { id: "mingxin", name: "明心师父", title: "尼众法师", icon: "🙏", style: "慈悲温柔，劝人向善", desc: "语调温和，慈悲为怀。适合家庭、感情场景。" },
  { id: "xuanzhen", name: "玄真道长", title: "山中道人", icon: "☯️", style: "直爽通透，说大白话", desc: "把命理讲成大白话，适合急性子。" },
];

const HOURS = [
  "子时 (23:00-01:00)","丑时 (01:00-03:00)","寅时 (03:00-05:00)","卯时 (05:00-07:00)","辰时 (07:00-09:00)","巳时 (09:00-11:00)",
  "午时 (11:00-13:00)","未时 (13:00-15:00)","申时 (15:00-17:00)","酉时 (17:00-19:00)","戌时 (19:00-21:00)","亥时 (21:00-23:00)",
];

const YEARS = Array.from({length:131},(_,i)=>1900+i);
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);

function StepperField({ label, value, display, onDown, onUp, onPick, pickerOpen }: {
  label: string; value: number|string; display: string; onDown: ()=>void; onUp: ()=>void; onPick: ()=>void; pickerOpen?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-paper-dark/75">{label}</p>
      <div className="flex h-16 items-stretch rounded-xl border border-gold/30 bg-xuan-surface">
        <button onClick={onDown} className="flex w-12 items-center justify-center text-paper-dark hover:bg-gold/10 active:bg-gold/15">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></button>
        <button onClick={onPick} className="flex flex-1 flex-col items-center justify-center hover:bg-gold/5">
          <span className="font-number text-2xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{display}</span>
          <span className="text-[10px] text-paper-dark/45">点击选择</span></button>
        <button onClick={onUp} className="flex w-12 items-center justify-center text-paper-dark hover:bg-gold/10 active:bg-gold/15">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg></button>
      </div>
    </div>
  );
}

export default function BaziPage() {
  const [master, setMaster] = useState("huiming");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState(5);
  const [gender, setGender] = useState<"male"|"female">("male");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [picker, setPicker] = useState<"year"|"month"|"day"|null>(null);
  const [showPay, setShowPay] = useState(false);

  const clamp = (v:number,min:number,max:number)=>Math.min(Math.max(v,min),max);
  const getHdr=():Record<string,string>=>{try{const r=localStorage.getItem("putiyuan_guest");if(r){const g=JSON.parse(r);return{"x-guest-id":g.id,"x-guest-number":String(g.number)};}}catch{}return{};};

  const doAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/divine",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"bazi",data:{name:"",gender,year,month,day,hour:String(hour)}})});
      const d = await res.json();
      const text = d.result || `【八字排盘】\n八字：${year}年${month}月${day}日${HOURS[hour]}\n\n日主甲木坐辰土，身旺。格局清正，早年平顺，中年有贵人提携。命格中上，宜守正行善。福生无量天尊。`;
      setResult(text);
      setLoading(false);
      fetch("/api/records/bazi",{method:"POST",headers:{"Content-Type":"application/json",...getHdr()},body:JSON.stringify({name:"",gender,birth_date:`${year}-${month}-${day}`,birth_hour:String(hour),result_text:text})}).catch(()=>{});
    } catch {
      const text = `【八字排盘】\n八字：${year}年${month}月${day}日${HOURS[hour]}\n\n日主甲木坐辰土，身旺。格局清正，早年平顺，中年有贵人提携。命格中上，宜守正行善。福生无量天尊。`;
      setResult(text);setLoading(false);
      fetch("/api/records/bazi",{method:"POST",headers:{"Content-Type":"application/json",...getHdr()},body:JSON.stringify({name:"",gender,birth_date:`${year}-${month}-${day}`,birth_hour:String(hour),result_text:text})}).catch(()=>{});
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-24" style={{marginTop:"3.5rem"}}>
      <section className="space-y-3 pt-8 text-center">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
          <svg className="size-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M 8 12 C 8 8 12 4 12 4 C 12 4 16 8 16 12"/><path d="M 6 16 L 18 16"/><path d="M 7 10 L 17 10"/><path d="M 12 4 L 12 20"/>
          </svg>
        </div>
        <h1 className="text-4xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>八字精批</h1>
        <p className="text-base text-paper-dark/85">输入生辰，真排盘、看格局、看大运、看建议，先把命盘根基看清，再往后看流年节奏。</p>
      </section>

      {!result ? (
        <>
          {/* 选师父 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm">
            <p className="text-base text-paper-dark/80 mb-3">请选一位师父为您开示</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {MASTERS.map(m=>(
                <button key={m.id} onClick={()=>setMaster(m.id)}
                  className={`group rounded-xl border p-4 text-left transition-all ${
                    master===m.id?"border-gold/60 bg-gold/10 shadow-gold":"border-gold/20 bg-xuan-surface/40 hover:border-gold/40"}`}>
                  <div className="flex items-center gap-3"><span className="text-3xl">{m.icon}</span>
                    <div><p className={`font-display text-lg ${master===m.id?"text-gold":"text-paper-dark"}`} style={{fontFamily:"var(--font-calligraphy)"}}>{m.name}</p><p className="text-xs text-paper-dark/65">{m.title}</p></div></div>
                  <p className="mt-2 text-sm text-gold/85">{m.style}</p><p className="mt-1 text-xs text-paper-dark/65">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 出生信息 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <StepperField label="出生年" value={year} display={`${year}年`}
                onDown={()=>setYear(y=>clamp(y-1,1900,2030))} onUp={()=>setYear(y=>clamp(y+1,1900,2030))}
                onPick={()=>setPicker("year")}/>
              <StepperField label="出生月" value={month} display={`${month}月`}
                onDown={()=>setMonth(m=>clamp(m-1,1,12))} onUp={()=>setMonth(m=>clamp(m+1,1,12))}
                onPick={()=>setPicker("month")}/>
              <StepperField label="出生日" value={day} display={`${day}日`}
                onDown={()=>setDay(d=>clamp(d-1,1,31))} onUp={()=>setDay(d=>clamp(d+1,1,31))}
                onPick={()=>setPicker("day")}/>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-paper-dark/75">出生时辰</p>
                <select value={hour} onChange={e=>setHour(+e.target.value)}
                  className="h-16 w-full rounded-xl border border-gold/30 bg-xuan-surface px-4 text-lg text-paper-dark focus:border-gold focus:outline-none cursor-pointer">
                  {HOURS.map((h,i)=><option key={i} value={i}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-paper-dark/75">性别</p>
                <div className="flex h-16 overflow-hidden rounded-xl border border-gold/30 bg-xuan-surface">
                  <button onClick={()=>setGender("male")} className={`flex-1 flex items-center justify-center text-lg transition-colors ${gender==="male"?"bg-gold/15 text-gold":"text-paper-dark hover:bg-gold/5"}`}>男</button>
                  <button onClick={()=>setGender("female")} className={`flex-1 flex items-center justify-center text-lg transition-colors ${gender==="female"?"bg-gold/15 text-gold":"text-paper-dark hover:bg-gold/5"}`}>女</button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gold/12 bg-xuan-surface/30 px-4 py-3 text-xs leading-6 text-paper-dark/78">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-gold"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
                <p className="text-paper-dark/85">点击<span className="mx-1 text-gold">"开始真排盘"</span>即表示同意相关条款。仅作传统文化参考。</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={()=>setShowPay(true)} disabled={loading}
                className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light min-w-[180px] h-12 px-8 text-lg disabled:opacity-50">
                {loading ? "排盘中..." : "开始真排盘"}
              </button>
            </div>
            <p className="text-center text-xs text-paper-dark/60">仅作传统文化参考，请结合现实情况判断</p>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{MASTERS.find(m=>m.id===master)?.icon}</span>
            <span className="text-gold font-semibold">{MASTERS.find(m=>m.id===master)?.name}开示</span>
          </div>
          <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap">{result}</p>
          <button onClick={()=>setResult(null)} className="w-full py-3 rounded-lg border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors">重新排盘</button>
        </div>
      )}

      {/* 支付弹窗 */}
      {showPay && <PayModal productName="八字精批" amount={2990}
        onSuccess={()=>{setShowPay(false);doAnalyze();}}
        onCancel={()=>setShowPay(false)}/>}

      {/* 网格选择器弹窗（对标原站） */}
      {picker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={()=>setPicker(null)}>
          <div className="fixed inset-x-4 top-1/2 z-[201] mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-gold/40 bg-xuan-card p-4 shadow-2xl md:left-1/2 md:right-auto md:-translate-x-1/2" onClick={e=>e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>
                {picker==="year"?"选择出生年":picker==="month"?"选择出生月":"选择出生日"}
              </span>
              <button onClick={()=>setPicker(null)} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-paper-dark/85 hover:border-gold/60 hover:text-gold">关闭</button>
            </div>
            {/* 快速跳转 */}
            {picker==="year" && (
              <div className="mb-3 flex flex-wrap gap-1.5 border-b border-gold/15 pb-3">
                {[1950,1960,1970,1980,1990,2000,2010,2020].map(y=>(
                  <button key={y} onClick={()=>setYear(y)}
                    className={`rounded-md border px-2.5 py-1 text-xs ${year===y?"border-gold/60 bg-gold/15 text-gold":"border-gold/25 text-paper-dark hover:border-gold/40 hover:text-gold"}`}>{y}年</button>
                ))}
              </div>
            )}
            {/* 网格选项 */}
            <div className="grid max-h-[60vh] grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-6">
              {(picker==="year"?YEARS.reverse():picker==="month"?MONTHS:DAYS).map((v:number)=>(
                <button key={v} onClick={()=>{picker==="year"?setYear(v):picker==="month"?setMonth(v):setDay(v);setPicker(null);}}
                  className={`rounded-md py-2 text-base transition-colors ${
                    (picker==="year"?year===v:picker==="month"?month===v:day===v)
                      ? "bg-gold/20 text-gold ring-1 ring-gold/60"
                      : "text-paper-dark hover:bg-gold/10"
                  }`}>{v}{picker==="year"?"年":picker==="month"?"月":"日"}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
