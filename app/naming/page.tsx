"use client";

import { useState } from "react";

const YEARS = Array.from({length:131},(_,i)=>1900+i).reverse();
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);
const HOURS = ["子时 (23:00-01:00)","丑时 (01:00-03:00)","寅时 (03:00-05:00)","卯时 (05:00-07:00)","辰时 (07:00-09:00)","巳时 (09:00-11:00)","午时 (11:00-13:00)","未时 (13:00-15:00)","申时 (15:00-17:00)","酉时 (17:00-19:00)","戌时 (19:00-21:00)","亥时 (21:00-23:00)"];
const STYLES = ["诗意","刚毅","儒雅","清逸","典雅","温润","大气","灵动","朴素","豪迈"];
const NAMING_TYPES = [
  { id:"pro", label:"专业起名", desc:"先真排八字，再结合字义、音韵与五行补益，讲清每个名字为什么适合。" },
  { id:"eval", label:"姓名测评", desc:"可测正在用的名字，也可对比备选名，看它是否贴八字、顺口、耐用。" },
];

function StepperField({ label, value, display, onDown, onUp, onPick }: {
  label:string; value:number; display:string; onDown:()=>void; onUp:()=>void; onPick:()=>void;
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

export default function NamingPage() {
  const [namingType, setNamingType] = useState("pro");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState("wu");
  const [gender, setGender] = useState<"male"|"female">("male");
  const [surname, setSurname] = useState("李");
  const [charCount, setCharCount] = useState(3);
  const [styles, setStyles] = useState<string[]>(["儒雅","温润"]);
  const [genChar, setGenChar] = useState("");
  const [avoidChar, setAvoidChar] = useState("");
  const [picker, setPicker] = useState<"year"|"month"|"day"|null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

  const toggleStyle = (s:string) => {
    if (styles.includes(s)) setStyles(styles.filter(x=>x!==s));
    else if (styles.length < 3) setStyles([...styles,s]);
  };

  const getHdr=():Record<string,string>=>{try{const r=localStorage.getItem("putiyuan_guest");if(r){const g=JSON.parse(r);return{"x-guest-id":g.id,"x-guest-number":String(g.number)};}}catch{}return{};};

  const handleSubmit = async () => {
    setLoading(true);
    const fallback = `【起名方案 · ${surname}氏${gender==="male"?"男孩":"女孩"}】\n\n八字：${year}年${month}月${day}日${HOURS.find(h=>h.startsWith(hour))?.slice(0,2)}时\n风格：${styles.join("、")}\n字数：${charCount}字名\n\n【推荐一】${surname}沐宸\n【推荐二】${surname}清和\n【推荐三】${surname}瑾瑜\n\n名字讲究八字喜忌、音韵笔画与古籍典出，缺一不可。`;
    try {
      const res = await fetch("/api/divine",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"naming",data:{surname,gender,year,month,day,style:styles.join(",")}})});
      const d = await res.json();
      const text = d.result || fallback;
      setResult(text); setLoading(false);
      fetch("/api/records/naming",{method:"POST",headers:{"Content-Type":"application/json",...getHdr()},body:JSON.stringify({surname,gender,birth_date:`${year}-${month}-${day}`,style:styles.join(","),result_text:text})}).catch(()=>{});
    } catch {
      setResult(fallback); setLoading(false);
      fetch("/api/records/naming",{method:"POST",headers:{"Content-Type":"application/json",...getHdr()},body:JSON.stringify({surname,gender,birth_date:`${year}-${month}-${day}`,style:styles.join(","),result_text:fallback})}).catch(()=>{});
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-24" style={{marginTop:"3.5rem"}}>
      {/* Hero */}
      <section className="space-y-4 pt-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-8 text-gold">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>
          </svg>
        </div>
        <h1 className="text-4xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>宝宝起名</h1>
        <p className="text-base leading-loose text-paper-dark/85 md:text-lg">起名不只看好不好听，更要贴八字、讲字义、讲音韵、讲为什么适合。<br className="hidden sm:inline"/>先把命盘喜忌看清，再把适合孩子长期使用的名字讲明白。</p>
      </section>

      {!result ? (
        <>
          {/* 起名类型 */}
          <div className="mx-auto grid max-w-3xl gap-3 md:grid-cols-2">
            {NAMING_TYPES.map(t=>(
              <button key={t.id} onClick={()=>setNamingType(t.id)}
                className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                  namingType===t.id?"border-gold/60 bg-gold/10 shadow-gold":"border-gold/20 bg-xuan-surface/40 hover:border-gold/40"}`}>
                <p className="font-display text-2xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{t.label}</p>
                <p className="mt-2 text-sm leading-6 text-paper-dark/75">{t.desc}</p>
              </button>
            ))}
          </div>

          {/* 表单 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-5">
            <div className="grid gap-4 md:grid-cols-[1fr_200px]">
              <div className="space-y-4">
                {/* 年月日 */}
                <div className="grid gap-3 md:grid-cols-3">
                  <StepperField label="出生年" value={year} display={`${year}年`}
                    onDown={()=>setYear(y=>clamp(y-1,1900,2030))} onUp={()=>setYear(y=>clamp(y+1,1900,2030))} onPick={()=>setPicker("year")}/>
                  <StepperField label="出生月" value={month} display={`${month}月`}
                    onDown={()=>setMonth(m=>clamp(m-1,1,12))} onUp={()=>setMonth(m=>clamp(m+1,1,12))} onPick={()=>setPicker("month")}/>
                  <StepperField label="出生日" value={day} display={`${day}日`}
                    onDown={()=>setDay(d=>clamp(d-1,1,31))} onUp={()=>setDay(d=>clamp(d+1,1,31))} onPick={()=>setPicker("day")}/>
                </div>

                {/* 时辰 + 性别 */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-paper-dark/75">出生时辰</p>
                    <select value={hour} onChange={e=>setHour(e.target.value)}
                      className="h-16 w-full rounded-xl border border-gold/30 bg-xuan-surface px-4 text-lg text-paper-dark focus:border-gold focus:outline-none cursor-pointer">
                      {HOURS.map((h,i)=><option key={i} value={h.slice(0,3)}>{h}</option>)}
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

                {/* 姓氏 */}
                <div className="space-y-2">
                  <p className="text-sm text-paper-dark/70">姓氏</p>
                  <input value={surname} onChange={e=>setSurname(e.target.value)} maxLength={2}
                    className="h-10 rounded-md border border-gold/20 bg-xuan-surface px-3 text-base text-paper-dark placeholder:text-ink-muted transition-all focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 w-full"/>
                </div>
              </div>

              {/* 字数 + 风格 */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-paper-dark/70">姓名总字数（含姓）</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={()=>setCharCount(2)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${charCount===2?"border-gold/40 bg-gold/10 text-gold":"border-gold/20 text-paper-dark"}`}>2 字（如 李安）</button>
                    <button onClick={()=>setCharCount(3)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${charCount===3?"border-gold/40 bg-gold/10 text-gold":"border-gold/20 text-paper-dark"}`}>3 字（如 李思远）</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-paper-dark/70">偏好风格（最多 3 项）</p>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map(s=>(
                      <button key={s} onClick={()=>toggleStyle(s)}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${styles.includes(s)?"border-gold/40 bg-gold/10 text-gold":"border-gold/20 text-paper-dark/75"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 辈分字 + 避讳字 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-paper-dark/70">家族辈分字（选填）</p>
                <input value={genChar} onChange={e=>setGenChar(e.target.value)} maxLength={12} placeholder="如：承 / 世 / 文"
                  className="h-10 rounded-md border border-gold/20 bg-xuan-surface px-3 text-base text-paper-dark placeholder:text-ink-muted transition-all focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 w-full"/>
                <p className="text-xs text-paper-dark/55">若家里已定辈分字，可交给师父一起纳入。</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-paper-dark/70">想避开的字（选填）</p>
                <input value={avoidChar} onChange={e=>setAvoidChar(e.target.value)} maxLength={8} placeholder="如：伟、强、敏"
                  className="h-10 rounded-md border border-gold/20 bg-xuan-surface px-3 text-base text-paper-dark placeholder:text-ink-muted transition-all focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 w-full"/>
                <p className="text-xs text-paper-dark/55">可填写重名多、家中忌讳或不喜之字。</p>
              </div>
            </div>

            {/* 起名讲究 */}
            <div className="rounded-2xl border border-gold/15 bg-xuan-surface/40 px-4 py-4 text-sm leading-7 text-paper-dark/80">
              <p>起名讲究：</p>
              <p>先看生辰八字，再看五行喜忌、音韵笔画与古籍典出，缺一不可。</p>
              <p>不是随意拼字凑名，而是为孩子定一份能伴随一生、经得起推敲的福名。</p>
            </div>

            {/* 条款 */}
            <div className="rounded-xl border border-gold/12 bg-xuan-surface/30 px-4 py-3 text-xs leading-6 text-paper-dark/78">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-gold"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
                <div className="space-y-1.5">
                  <p className="text-paper-dark/85">点击<span className="mx-1 text-gold">"开始专业起名"</span>即表示同意相关条款。</p>
                  <p className="text-paper-dark/65">仅作传统文化参考，请结合现实情况判断；未满18周岁请勿使用本服务。</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={handleSubmit} disabled={loading}
                className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light min-w-[180px] h-12 px-8 text-lg disabled:opacity-50">
                {loading ? "起名中..." : "开始专业起名"}
              </button>
            </div>
            <p className="text-center text-xs text-paper-dark/60">仅作传统文化参考，请结合现实情况判断</p>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-4 animate-slide-up">
          <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap">{result}</p>
          <button onClick={()=>setResult(null)} className="w-full py-3 rounded-lg border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors">重新起名</button>
        </div>
      )}

      {/* 网格选择器 */}
      {picker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={()=>setPicker(null)}>
          <div className="fixed inset-x-4 top-1/2 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-gold/40 bg-xuan-card p-4 shadow-2xl md:left-1/2 md:right-auto md:-translate-x-1/2" onClick={e=>e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>
                {picker==="year"?"选择出生年":picker==="month"?"选择出生月":"选择出生日"}
              </span>
              <button onClick={()=>setPicker(null)} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-paper-dark/85 hover:border-gold/60 hover:text-gold">关闭</button>
            </div>
            {picker==="year" && (
              <div className="mb-3 flex flex-wrap gap-1.5 border-b border-gold/15 pb-3">
                {[1950,1960,1970,1980,1990,2000,2010,2020].map(y=>(
                  <button key={y} onClick={()=>setYear(y)} className={`rounded-md border px-2.5 py-1 text-xs ${year===y?"border-gold/60 bg-gold/15 text-gold":"border-gold/25 text-paper-dark hover:border-gold/40 hover:text-gold"}`}>{y}年</button>
                ))}
              </div>
            )}
            <div className="grid max-h-[60vh] grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-6">
              {(picker==="year"?YEARS:picker==="month"?MONTHS:DAYS).map((v:number)=>(
                <button key={v} onClick={()=>{picker==="year"?setYear(v):picker==="month"?setMonth(v):setDay(v);setPicker(null);}}
                  className={`rounded-md py-2 text-base transition-colors ${(picker==="year"?year===v:picker==="month"?month===v:day===v)?"bg-gold/20 text-gold ring-1 ring-gold/60":"text-paper-dark hover:bg-gold/10"}`}>{v}{picker==="year"?"年":picker==="month"?"月":"日"}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
