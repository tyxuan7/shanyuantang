"use client";

import { useState } from "react";
import PayModal from "@/components/PayModal";

const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const WX_COLORS: Record<string, string> = {
  "金":"border-yellow-300 bg-yellow-100 text-yellow-800",
  "木":"border-green-300 bg-green-100 text-green-800",
  "水":"border-blue-300 bg-blue-100 text-blue-800",
  "火":"border-red-300 bg-red-100 text-red-800",
  "土":"border-amber-300 bg-amber-100 text-amber-800",
};
const WX_COLORS_CHART: Record<string, string> = {
  "金":"#C9A96E","木":"#7BA686","水":"#6B9BD2","火":"#D65D5D","土":"#D4A45A",
};

const MASTERS = [
  { id:"huiming",name:"慧明长老",title:"古寺住持",icon:"🧘",style:"庄重持重，引经据典",desc:"通读《渊海子平》《滴天髓》，言语稳重克制。适合希望深度解读、看古籍出处的施主。" },
  { id:"mingxin",name:"明心师父",title:"尼众法师",icon:"🙏",style:"慈悲温柔，劝人向善",desc:"语调温和，慈悲为怀。适合家庭、感情、亲人祈福场景。" },
  { id:"xuanzhen",name:"玄真道长",title:"山中道人",icon:"☯️",style:"直爽通透，说大白话",desc:"山中道人，不爱绕弯子。把命理讲成大白话，适合急性子。" },
];

const HOURS = ["子时 (23:00-01:00)","丑时 (01:00-03:00)","寅时 (03:00-05:00)","卯时 (05:00-07:00)","辰时 (07:00-09:00)","巳时 (09:00-11:00)","午时 (11:00-13:00)","未时 (13:00-15:00)","申时 (15:00-17:00)","酉时 (17:00-19:00)","戌时 (19:00-21:00)","亥时 (21:00-23:00)"];

const YEARS = Array.from({length:131},(_,i)=>1900+i);
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);

export default function BaziPage() {
  const [master,setMaster]=useState("huiming");
  const [year,setYear]=useState(1990);
  const [month,setMonth]=useState(5);
  const [day,setDay]=useState(15);
  const [hour,setHour]=useState(7);
  const [gender,setGender]=useState<"male"|"female">("male");
  const [loading,setLoading]=useState(false);
  const [baziData,setBaziData]=useState<any>(null);
  const [fullResult,setFullResult]=useState<string|null>(null);
  const [showPay,setShowPay]=useState(false);
  const [picker,setPicker]=useState<"year"|"month"|"day"|null>(null);

  const clamp=(v:number,min:number,max:number)=>Math.min(Math.max(v,min),max);

  const doCalculate=async()=>{
    setLoading(true);
    try{
      const res=await fetch("/api/bazi/calculate",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({year,month,day,hour}),
      });
      const d=await res.json();
      if(d.success)setBaziData(d);
    }catch{}finally{setLoading(false);}
  };

  const doFullAnalyze=async()=>{
    setLoading(true);
    try{
      const res=await fetch("/api/divine",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"bazi",data:{name:"",gender,year,month,day,hour:String(hour)}}),
      });
      const d=await res.json();
      setFullResult(d.result||"命理分析完成，福生无量天尊。");
    }catch{}finally{setLoading(false);}
  };

  // 简化雷达图 - 5个点
  const renderRadar=()=>{
    if(!baziData)return null;
    const wd=baziData.wuXing;
    const cx=130,cy=120,r=82.8;
    const angles=[-90,-18,54,126,198].map(a=>a*Math.PI/180);
    const pts=wd.map((w:any,i:number)=>({
      x:cx+r*(w.pct/100)*Math.cos(angles[i]),
      y:cy+r*(w.pct/100)*Math.sin(angles[i]),
    }));
    const polygonPts = pts.map((p:any)=>`${p.x},${p.y}`).join(" ");
    return(
      <svg viewBox="0 0 260 240" className="w-full max-w-[260px] mx-auto">
        {/* 网格 */}
        {[0.25,0.5,0.75,1].map(s=>(
          <polygon key={s} points={angles.map(a=>`${cx+r*s*Math.cos(a)},${cy+r*s*Math.sin(a)}`).join(" ")} fill="none" stroke="rgba(201,169,110,0.2)" strokeWidth="1"/>
        ))}
        {/* 轴线 */}
        {angles.map((a,i)=>(
          <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="rgba(201,169,110,0.2)"/>
        ))}
        {/* 数据 */}
        <polygon points={polygonPts} fill="rgba(201,169,110,0.15)" stroke="#C9A96E" strokeWidth="2"/>
        {/* 标签 */}
        {wd.map((w:any,i:number)=>{
          const ax=cx+(r+16)*Math.cos(angles[i]),ay=cy+(r+16)*Math.sin(angles[i]);
          return <text key={i} x={ax} y={ay} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#D4C5A9">{w.name}</text>;
        })}
        {pts.map((p:any,i:number)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="#C9A96E"/>)}
      </svg>
    );
  };

  // 人生K线
  const renderLifeCurve=()=>{
    if(!baziData)return null;
    const lc=baziData.lifeCurve;
    const w=720,h=180,pad=40;
    const maxS=Math.max(...lc.map((l:any)=>l.score),1);
    const pts=lc.map((l:any,i:number)=>{
      const x=pad+(w-2*pad)*i/(lc.length-1);
      const y=h-pad-(h-2*pad)*(l.score/maxS);
      return `${x},${y}`;
    }).join(" ");
    return(
      <svg viewBox={`0 0 ${w+2*pad} ${h+2*pad}`} className="w-full min-w-[500px]" preserveAspectRatio="none">
        {/* 网格 */}
        {[0,25,50,75,100].map(v=>{
          const y=h-pad-(h-2*pad)*v/100;
          return <g key={v}><line x1={pad} y1={y} x2={w-pad} y2={y} stroke="rgba(201,169,110,0.12)" strokeDasharray="3 3"/><text x={pad-6} y={y+4} textAnchor="end" fontSize="10" fill="rgba(201,169,110,0.6)">{v}</text></g>;
        })}
        {/* 中线 */}
        <line x1={pad} y1={h/2} x2={w-pad} y2={h/2} stroke="rgba(201,169,110,0.3)" strokeDasharray="6 4"/>
        {/* 数据线 */}
        <polyline points={pts} fill="none" stroke="#C9A96E" strokeWidth="2"/>
        {/* X轴 */}
        {lc.filter((_:any,i:number)=>i%4===0).map((l:any,i:number)=>{
          const idx=i*4;
          const x=pad+(w-2*pad)*idx/(lc.length-1);
          return <text key={i} x={x} y={h-pad+16} textAnchor="middle" fontSize="10" fill="rgba(201,169,110,0.7)">{l.age}岁</text>;
        })}
        {/* 点 */}
        {lc.map((l:any,i:number)=>{
          const x=pad+(w-2*pad)*i/(lc.length-1);
          const y=h-pad-(h-2*pad)*(l.score/maxS);
          if(i===6) return <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke="#C9A96E" strokeWidth="2"/>;
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#C9A96E" opacity="0.7"/>;
        })}
      </svg>
    );
  };

  return(
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-24" style={{marginTop:"3.5rem"}}>
      {/* 标题 */}
      <section className="space-y-3 pt-8 text-center">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
          <svg className="size-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12c0-4 4-8 4-8s4 4 4 8"/><path d="M6 16h12"/><path d="M7 10h10"/><path d="M12 4v16"/></svg>
        </div>
        <h1 className="text-4xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>八字精批</h1>
        <p className="text-base text-paper-dark/85">输入生辰，真排盘、看格局、看大运、看建议，先把命盘根基看清，再往后看流年节奏。</p>
      </section>

      {/* 选师父 */}
      {!baziData&&(
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm">
          <p className="text-base text-paper-dark/80 mb-3">请选一位师父为您开示</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MASTERS.map(m=>(
              <button key={m.id} onClick={()=>setMaster(m.id)}
                className={`group rounded-xl border p-4 text-left transition-all ${master===m.id?"border-gold/60 bg-gold/10 shadow-gold":"border-gold/20 bg-xuan-surface/40 hover:border-gold/40"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div><p className={`font-display text-lg ${master===m.id?"text-gold":"text-paper-dark"}`} style={{fontFamily:"var(--font-calligraphy)"}}>{m.name}</p><p className="text-xs text-paper-dark/65">{m.title}</p></div>
                </div>
                <p className="mt-2 text-sm text-gold/85">{m.style}</p><p className="mt-1 text-xs text-paper-dark/65">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入表单 */}
      <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          {[{label:"出生年",v:year,d:`${year}年`,down:()=>setYear(y=>clamp(y-1,1900,2030)),up:()=>setYear(y=>clamp(y+1,1900,2030)),pick:()=>setPicker("year")},
            {label:"出生月",v:month,d:`${month}月`,down:()=>setMonth(m=>clamp(m-1,1,12)),up:()=>setMonth(m=>clamp(m+1,1,12)),pick:()=>setPicker("month")},
            {label:"出生日",v:day,d:`${day}日`,down:()=>setDay(d=>clamp(d-1,1,31)),up:()=>setDay(d=>clamp(d+1,1,31)),pick:()=>setPicker("day")}].map(f=>(
            <div key={f.label} className="space-y-2">
              <p className="text-sm text-paper-dark/75">{f.label}</p>
              <div className="flex h-16 items-stretch rounded-xl border border-gold/30 bg-xuan-surface">
                <button onClick={f.down} className="flex w-12 items-center justify-center text-paper-dark hover:bg-gold/10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></button>
                <button onClick={f.pick} className="flex flex-1 flex-col items-center justify-center hover:bg-gold/5">
                  <span className="font-number text-2xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{f.d}</span>
                  <span className="text-[10px] text-paper-dark/45">点击选择</span>
                </button>
                <button onClick={f.up} className="flex w-12 items-center justify-center text-paper-dark hover:bg-gold/10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg></button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-paper-dark/75">出生时辰</p>
            <select value={hour} onChange={e=>setHour(+e.target.value)} className="h-16 w-full rounded-xl border border-gold/30 bg-xuan-surface px-4 text-lg text-paper-dark focus:border-gold focus:outline-none">
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

        {/* 协议说明 */}
        <div className="rounded-xl border border-gold/12 bg-xuan-surface/30 px-4 py-3 text-xs leading-6 text-paper-dark/78">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-gold"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div className="space-y-1.5">
              <p>点击<span className="mx-1 text-gold">"开始真排盘"</span>即表示您已阅读并同意<a className="mx-1 text-gold hover:text-gold-light" href="/terms/">《用户协议》</a><a className="mr-1 text-gold hover:text-gold-light" href="/privacy/">《隐私说明》</a>与<a className="ml-1 text-gold hover:text-gold-light" href="/ai-notice/">《AI 生成说明》</a>，并同意我们按说明处理您主动提交的生辰信息。</p>
              <p className="text-paper-dark/65">仅作传统文化参考，请结合现实情况判断；未满18周岁请勿使用本服务。</p>
            </div>
          </div>
        </div>

        {!baziData?(
          <div className="flex justify-center">
            <button onClick={doCalculate} disabled={loading}
              className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light min-w-[180px] h-12 px-8 text-lg disabled:opacity-50">
              {loading?"排盘中...":"开始真排盘"}
            </button>
          </div>
        ):(
          <div className="flex justify-center">
            <button onClick={()=>{setBaziData(null);setFullResult(null);}}
              className="text-sm text-paper-muted hover:text-gold">重新输入生辰</button>
          </div>
        )}
        <p className="text-center text-xs text-paper-dark/60">仅作传统文化参考，请结合现实情况判断</p>
      </div>

      {/* ==== 免费预览 ==== */}
      {baziData&&(
        <>
          {/* 四柱 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>八字四柱</h2>
              <p className="text-base text-paper-dark/85">{baziData.dayGanDesc} 命，生于 {baziData.lunarDate}</p>
            </div>
            <div className="mx-auto grid max-w-md grid-cols-4 gap-2 md:gap-4">
              {["年柱","月柱","日柱","时柱"].map((lb:string)=><div key={lb} className="text-center text-xs text-ink-muted">{lb}</div>)}
              {baziData.pillars.map((p:any,i:number)=>(
                <div key={`g${i}`} className={`aspect-square rounded-md border text-center text-2xl font-mono md:text-3xl flex items-center justify-center ${i===2?"border-vermillion bg-vermillion text-white shadow-stamp":"border-gold/20 bg-xuan-surface text-paper-dark"}`}>
                  {p.gan}
                </div>
              ))}
              {baziData.pillars.map((p:any,i:number)=>(
                <div key={`z${i}`} className="aspect-square rounded-md border text-center text-2xl font-mono md:text-3xl flex items-center justify-center border-gold/20 bg-xuan-surface text-paper-dark">
                  {p.zhi}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-2.5 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs text-gold">日主·{baziData.dayGanDesc}</span>
              <span className="px-2.5 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs text-gold">{baziData.wuXing.find((e:any)=>e.pct===100)?.name||""}偏强</span>
              <span className="px-2.5 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs text-gold">庚金身强</span>
            </div>
          </div>

          {/* 五行分析 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-6">
            <h2 className="text-3xl text-gold text-center" style={{fontFamily:"var(--font-calligraphy)"}}>五行分析</h2>
            <div className="grid gap-6 md:grid-cols-[320px_1fr] md:items-center">
              <div className="flex w-full max-w-[260px] flex-col items-center md:max-w-[320px]">
                {renderRadar()}
                <p className="mt-2 text-center text-sm text-paper-dark/70">日主：{baziData.dayGanDesc}</p>
              </div>
              <div className="space-y-3">
                {baziData.wuXing.map((w:any)=>(
                  <div key={w.name} className="rounded-lg border border-gold/15 bg-xuan-surface/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${WX_COLORS[w.name]||""}`}>{w.name}</span>
                      <span className="font-number text-lg text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{w.pct}</span>
                    </div>
                    <p className="mt-2 text-base text-paper-dark/85">{w.level} · 数量 {w.value}</p>
                  </div>
                ))}
                <p className="text-base text-paper-dark">喜用神：<span className="text-gold">{baziData.yongShen?.join("、")}</span> ｜ 忌神：<span className="text-vermillion">{baziData.jiShen?.join("、")}</span></p>
              </div>
            </div>
          </div>

          {/* 人生K线 */}
          <div className="rounded-lg border-2 border-gold/50 bg-gradient-to-br from-xuan-card via-xuan-surface/80 to-xuan-card p-card-pad shadow-paper backdrop-blur-sm space-y-4">
            <h2 className="text-3xl text-gold text-center" style={{fontFamily:"var(--font-calligraphy)"}}>人生走势</h2>
            <div className="overflow-x-auto">
              {renderLifeCurve()}
            </div>
            <p className="text-center text-sm text-paper-dark/85">人生大致走势，仅供参考。高峰宜把握、低谷宜稳守。</p>
            {/* 阶段分数 */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {[
                {label:"童年（0-15）",s:baziData.lifeCurve[1]?.score||55,desc:"童年根基期，看健康与家庭。"},
                {label:"少年（16-25）",s:baziData.lifeCurve[4]?.score||57,desc:"求学立志期，看学业与方向。"},
                {label:"青年（26-40）",s:baziData.lifeCurve[7]?.score||70,desc:"立业打底期，看事业与婚姻。"},
                {label:"中年（41-55）",s:baziData.lifeCurve[10]?.score||67,desc:"厚积薄发期，看格局与积累。"},
                {label:"晚年（56-75）",s:baziData.lifeCurve[14]?.score||64,desc:"收获沉淀期，看健康与心境。"},
                {label:"耄耋（76-100）",s:baziData.lifeCurve[18]?.score||58,desc:"天伦福报期，看子孙与心安。"},
              ].map(st=>(
                <div key={st.label} className="rounded-lg border border-gold/15 bg-xuan-surface/50 p-3 text-center">
                  <p className="text-sm text-paper-dark/75">{st.label}</p>
                  <p className="font-number text-2xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{st.s}</p>
                  <p className="mt-1 text-xs text-paper-dark/65">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ==== 付费区域 ==== */}
          {!fullResult?(
            <div className="relative space-y-5 px-2 py-4 text-center bg-gradient-to-br from-xuan-card via-xuan-surface/80 to-xuan-card rounded-lg border-2 border-gold/50 p-card-pad shadow-paper">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-gold/50 bg-gold/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-8 text-gold"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div>
                <h2 className="font-display text-3xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>解锁完整命理</h2>
                <p className="mt-1 text-sm tracking-widest text-gold/85">下方所有内容仅需 ¥9.9 一次解锁，本次命盘终身可看</p>
              </div>
              <p className="font-display text-5xl text-vermillion-light drop-shadow-[0_0_20px_rgba(196,61,61,0.4)]">¥ 9.9</p>
              <ul className="mx-auto grid max-w-md gap-3 text-left text-base text-paper">
                {[
                  {label:"人生K线图",desc:"100年逐年运势曲线，看清一生起伏"},
                  {label:"多风格深度解读",desc:"事业/财运/感情/健康四大核心，每段350-600字含古籍引证"},
                  {label:"10步大运推演",desc:"每步十年，吉凶用神配合详解"},
                  {label:"流年逐月走势",desc:"今年12个月吉凶时机+明年预告"},
                  {label:"古籍引证",desc:"《渊海子平》《滴天髓》《三命通会》等6部经典"},
                ].map(item=>(
                  <li key={item.label} className="flex items-start gap-2">
                    <span className="mt-1 inline-block size-2 shrink-0 rounded-full bg-gold"></span>
                    <span><span className="font-display text-gold">{item.label}</span> · {item.desc}</span>
                  </li>
                ))}
              </ul>
              <button onClick={()=>setShowPay(true)}
                className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light h-12 px-8 mx-auto mt-3 max-w-sm w-full text-lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 size-5"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>解锁全部命理 ¥9.9
              </button>
              <p className="text-xs text-paper-dark/60">一次付费 · 立即解锁 · 本次命盘终身可看</p>
            </div>
          ):(
            /* 完整AI分析结果 */
            <div className="rounded-lg border border-gold/30 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MASTERS.find(m=>m.id===master)?.icon}</span>
                <span className="text-gold font-semibold text-lg">{MASTERS.find(m=>m.id===master)?.name}开示</span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap">{fullResult}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* 付费弹窗 */}
      {showPay && <PayModal productName="八字精批深度版" amount={990}
        onSuccess={()=>{setShowPay(false);doFullAnalyze();}}
        onCancel={()=>setShowPay(false)}/>}

      {/* 日期选择器弹窗 */}
      {picker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={()=>setPicker(null)}>
          <div className="fixed inset-x-4 top-1/2 z-[201] mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-gold/40 bg-xuan-card p-4 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>
                {picker==="year"?"选择出生年":picker==="month"?"选择出生月":"选择出生日"}
              </span>
              <button onClick={()=>setPicker(null)} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-paper-dark/85 hover:border-gold/60">关闭</button>
            </div>
            {picker==="year" && (
              <div className="mb-3 flex flex-wrap gap-1.5 border-b border-gold/15 pb-3">
                {[1950,1960,1970,1980,1990,2000,2010,2020].map(y=>(
                  <button key={y} onClick={()=>setYear(y)} className={`rounded-md border px-2.5 py-1 text-xs ${year===y?"border-gold/60 bg-gold/15 text-gold":"border-gold/25 text-paper-dark hover:border-gold/40"}`}>{y}年</button>
                ))}
              </div>
            )}
            <div className="grid max-h-[60vh] grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-6">
              {(picker==="year"?YEARS.reverse():picker==="month"?MONTHS:DAYS).map((v:number)=>(
                <button key={v} onClick={()=>{picker==="year"?setYear(v):picker==="month"?setMonth(v):setDay(v);setPicker(null);}}
                  className={`rounded-md py-2 text-base transition-colors ${
                    (picker==="year"?year===v:picker==="month"?month===v:day===v)
                      ?"bg-gold/20 text-gold ring-1 ring-gold/60"
                      :"text-paper-dark hover:bg-gold/10"
                  }`}>{v}{picker==="year"?"年":picker==="month"?"月":"日"}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
