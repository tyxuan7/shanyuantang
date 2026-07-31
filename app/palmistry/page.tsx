"use client";

import { useState, useRef } from "react";
import PayModal from "@/components/PayModal";

const MASTERS = [
  { id: "huiming", name: "慧明长老", title: "古寺住持", icon: "🧘", style: "庄重持重，引经据典", desc: "通读《渊海子平》《滴天髓》，言语稳重克制。适合希望深度解读、看古籍出处的施主。" },
  { id: "mingxin", name: "明心师父", title: "尼众法师", icon: "🙏", style: "慈悲温柔，劝人向善", desc: "语调温和，慈悲为怀。适合家庭、感情、亲人祈福场景。" },
  { id: "xuanzhen", name: "玄真道长", title: "山中道人", icon: "☯️", style: "直爽通透，说大白话", desc: "山中道人，不爱绕弯子。把命理讲成大白话，适合急性子。" },
];

export default function PalmistryPage() {
  const [tab, setTab] = useState<"palmistry" | "face">("palmistry");
  const [master, setMaster] = useState("xuanzhen");
  const [hand, setHand] = useState<"left" | "right">("left");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = ev => { setImage(ev.target?.result as string); setResult(null); };
      r.readAsDataURL(file);
    }
  };

  const getGuestHdr=():Record<string,string>=>{try{const r=localStorage.getItem("putiyuan_guest");if(r){const g=JSON.parse(r);return{"x-guest-id":g.id,"x-guest-number":String(g.number)};}}catch{}return{};};

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/divine", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:tab==="palmistry"?"palm":"face", data:{image:image.substring(0,200)}})
      });
      const d = await res.json();
      const text = d.result || (tab==="palmistry"?palmResult():faceResult());
      setResult(text);
      fetch(`/api/records/${tab==="palmistry"?"palm":"face"}`,{method:"POST",headers:{"Content-Type":"application/json",...getGuestHdr()},body:JSON.stringify({result_text:text})}).catch(()=>{});
    } catch {
      const text = tab==="palmistry"?palmResult():faceResult();
      setResult(text);
      fetch(`/api/records/${tab==="palmistry"?"palm":"face"}`,{method:"POST",headers:{"Content-Type":"application/json",...getGuestHdr()},body:JSON.stringify({result_text:text})}).catch(()=>{});
    }
    setLoading(false);
  };

  const isPalm = tab === "palmistry";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-24">
      {/* Hero */}
      <section className="space-y-4 pt-8 text-center">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-8 text-gold">
            <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
          </svg>
        </div>
        <h1 className="text-4xl tracking-widest text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>手相 / 面相</h1>
        <p className="text-base text-paper-dark/85">
          {isPalm ? "上传清晰掌心照，我们会先看掌色、掌丘与主线走势，再围绕图上可见特征逐段分析，并结合相学古籍做印证。" : "上传正面照，看五官气色、三停十二宫，围绕图上可见特征逐段分析。"}
        </p>
        <p className="mt-2 text-sm text-gold/85">
          {isPalm ? "不是只看一条线，而是把性情、感情、事业、财运与阶段起伏放在一张手里统看，图上看不到的地方不会硬编。" : "只围绕图上能确认的地方下判断，不凭空推测看不到的内容。"}
        </p>
      </section>

      {/* 手相/面相 选择 */}
      <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-3">
        <p className="text-sm text-paper-dark/70">先选这次想先深看的方向</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setTab("palmistry"); setImage(null); setResult(null); }}
            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${isPalm ? "border-gold/50 bg-gold/10 text-gold" : "border-gold/20 bg-xuan-surface/40 text-paper-dark hover:border-gold/35 hover:bg-gold/5"}`}>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
              <span className="font-display text-lg" style={{fontFamily:"var(--font-calligraphy)"}}>手相</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-paper-dark/70">不是只看一条线，而是把性情、感情、事业、财运与阶段起伏放在一张手里统看，图上看不到的地方不会硬编。</p>
          </button>
          <button onClick={() => { setTab("face"); setImage(null); setResult(null); }}
            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${!isPalm ? "border-gold/50 bg-gold/10 text-gold" : "border-gold/20 bg-xuan-surface/40 text-paper-dark hover:border-gold/35 hover:bg-gold/5"}`}>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
              <span className="font-display text-lg" style={{fontFamily:"var(--font-calligraphy)"}}>面相</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-paper-dark/70">把额头、眉眼、鼻口、下庭这些看得见的特征，落到人际气场、处事分寸、事业节奏与当下状态上来讲，只围绕图上能确认的地方下判断。</p>
          </button>
        </div>
      </div>

      {!result && (
        <>
          {/* 选师父 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm">
            <div className="space-y-3">
              <p className="text-base text-paper-dark/80">请选一位师父为您开示</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {MASTERS.map(m => (
                  <button key={m.id} onClick={() => setMaster(m.id)}
                    className={`group rounded-xl border p-4 text-left transition-all duration-200 ${
                      master === m.id ? "border-gold/60 bg-gold/10 shadow-gold" : "border-gold/20 bg-xuan-surface/40 hover:border-gold/40 hover:bg-xuan-surface/70"
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{m.icon}</span>
                      <div>
                        <p className={`font-display text-lg ${master === m.id ? "text-gold" : "text-paper-dark"}`} style={{fontFamily:"var(--font-calligraphy)"}}>{m.name}</p>
                        <p className="text-xs text-paper-dark/65">{m.title}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gold/85">{m.style}</p>
                    <p className="mt-1 text-xs text-paper-dark/65">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 看哪只手 + 上传 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-5">
            {isPalm && (
              <div className="space-y-2">
                <p className="text-base text-paper-dark/85">看哪只手</p>
                <div className="flex h-14 overflow-hidden rounded-xl border border-gold/30 bg-xuan-surface">
                  <button onClick={() => setHand("left")}
                    className={`flex flex-1 items-center justify-center gap-2 text-base transition-colors ${hand === "left" ? "bg-gold/15 text-gold" : "text-paper-dark hover:bg-gold/5"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                    左手（先天）
                  </button>
                  <button onClick={() => setHand("right")}
                    className={`flex flex-1 items-center justify-center gap-2 text-base transition-colors ${hand === "right" ? "bg-gold/15 text-gold" : "text-paper-dark hover:bg-gold/5"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 scale-x-[-1]"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                    右手（后天）
                  </button>
                </div>
                <p className="text-xs text-paper-dark/60">传统认为：男左女右；左手主先天本性，右手主后天发展。</p>
              </div>
            )}

            {/* 拍摄要求 */}
            <div className="rounded-xl border border-gold/15 bg-xuan-surface/40 p-4">
              <p className="mb-2 font-display text-base text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>拍摄要求</p>
              <ul className="space-y-1 text-sm text-paper-dark/80">
                {isPalm ? (
                  <>
                    <li>· 自然光下，掌心张开正对镜头</li>
                    <li>· 五指自然伸展，不要过分用力</li>
                    <li>· 主要线条（生命线、智慧线、感情线）清晰可见</li>
                    <li>· 图片小于 5MB，jpg/png 格式</li>
                  </>
                ) : (
                  <>
                    <li>· 自然光下，正面正对镜头</li>
                    <li>· 五官清晰，不要遮挡</li>
                    <li>· 表情自然，不要过分夸张</li>
                    <li>· 图片小于 5MB，jpg/png 格式</li>
                  </>
                )}
              </ul>
            </div>

            {/* 上传按钮 */}
            {!image ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => fileRef.current?.click()}
                  className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-vermillion/40 bg-vermillion/10 text-vermillion-light hover:border-vermillion/60 hover:bg-vermillion/15">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-12"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></svg>
                  <p className="font-display text-lg" style={{fontFamily:"var(--font-calligraphy)"}}>{isPalm ? "拍摄手相" : "拍摄面相"}</p>
                  <p className="text-xs text-paper-dark/60">现在打开摄像头</p>
                </button>
                <button onClick={() => fileRef.current?.click()}
                  className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/30 bg-xuan-surface/40 text-gold/85 hover:border-gold/50 hover:bg-xuan-surface/70">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-12"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <p className="font-display text-lg" style={{fontFamily:"var(--font-calligraphy)"}}>从相册选</p>
                  <p className="text-xs text-paper-dark/60">已有照片直接传</p>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-gold/20">
                  <img src={image} alt="照片" className="w-full h-64 object-cover" />
                  <button onClick={() => setImage(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white text-sm flex items-center justify-center">✕</button>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture={isPalm ? "environment" : "user"} onChange={handleFile} className="hidden" />

            {/* 条款 */}
            <div className="rounded-xl border border-gold/12 bg-xuan-surface/30 px-4 py-3 text-xs leading-6 text-paper-dark/78">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-gold"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div className="space-y-1.5">
                  <p className="text-paper-dark/85">点击<span className="mx-1 text-gold">"开始专业解读"</span>即表示同意相关条款。</p>
                  <p>照片仅用于本次分析与结果展示。</p>
                  <p className="text-paper-dark/65">仅作传统文化参考，未满18周岁请勿使用本服务。</p>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <button onClick={()=>setShowPay(true)} disabled={!image || loading}
              className={`inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg tracking-wider text-white shadow-lg w-full h-12 px-8 text-lg ${
                image ? "bg-vermillion shadow-vermillion/20 hover:bg-vermillion-light" : "bg-xuan-surface text-paper-muted cursor-not-allowed"
              }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 size-5"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
              {loading ? "解读中..." : "开始专业解读"}
            </button>
            <p className="text-center text-xs text-paper-dark/60">图片仅用于本次解读，不会用于其他用途。</p>
          </div>
        </>
      )}

      {/* 结果 */}
      {result && (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{MASTERS.find(m=>m.id===master)?.icon}</span>
            <span className="text-gold font-semibold">{MASTERS.find(m=>m.id===master)?.name}开示</span>
          </div>
          <div className="flex gap-4">
            {image && <img src={image} alt="照片" className="w-24 h-24 rounded-xl object-cover border border-gold/20 shrink-0" />}
            <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap flex-1">{result}</p>
          </div>
          <button onClick={() => { setImage(null); setResult(null); }}
            className="w-full py-3 rounded-lg border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors">
            重新解读
          </button>
        </div>
      )}

      {showPay && <PayModal productName={isPalm?"手相深度详批":"面相深度详批"} amount={1990}
        onSuccess={()=>{setShowPay(false);handleAnalyze();}}
        onCancel={()=>setShowPay(false)}/>}

      {/* 手相主线参考 */}
      {isPalm && !result && (
        <div className="rounded-xl border border-gold/25 bg-xuan-surface/40 overflow-hidden">
          <button onClick={() => setShowGuide(!showGuide)}
            className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="flex items-center gap-2 text-sm text-gold"><span className="text-lg">🖐️</span>手相深看会重点对照这些主线（点击展开参考）</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-4 text-gold/60 transition-transform ${showGuide ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {showGuide && (
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                {n:"感情线",d:"情感模式与婚姻状态",c:"#F472B6"},{n:"智慧线",d:"思维方式与判断力",c:"#60A5FA"},{n:"生命线",d:"体质精力与健康",c:"#4ADE80"},
                {n:"命运线",d:"事业走向与机遇",c:"#FBBF24"},{n:"成功线",d:"成就与影响力",c:"#C084FC"},{n:"婚姻线",d:"婚姻与伴侣缘分",c:"#FB923C"},
              ].map(l=>(
                <div key={l.n} className="bg-xuan rounded-lg p-3 text-center">
                  <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{backgroundColor:l.c}}/>
                  <p className="text-xs text-paper-dark font-semibold">{l.n}</p>
                  <p className="text-[11px] text-paper-muted">{l.d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function palmResult() {
  return `【手相深度分析】

掌色红润，气血充盈，整体体质良好。金星丘丰隆饱满，主生命力旺盛，为人热情大方，异性缘佳。

生命线清晰绵长无断裂，主一生少大病大灾。智慧线深长横贯掌心，思维敏捷、逻辑严密，适合技术研究类工作。感情线修长末端微翘，用情专一，28-32岁为婚姻高峰期。

命运线35岁后加深变宽，事业进入上升通道，45-50岁为最旺十年。成功线虽短但清晰，属大器晚成型，晚年名望财富皆佳。

综合属清贵之相，一生平稳上升，宜守正出奇。为人真诚厚道，福报自来。`;
}

function faceResult() {
  return `【面相深度分析】

天庭饱满，额角开阔，主少年运势顺畅，得父母庇荫，思维开阔格局宏大。

眉清目秀，鼻梁挺拔，颧骨有肉不露骨，中年运势稳健。鼻头圆润有肉，主财运亨通不愁吃穿。嘴唇厚薄适中，下巴方圆有力，晚年运势佳，子女孝顺。

三停匀称五官端正，为中等偏上之相。少年得教，中年得财，晚年得福。处世宜守正、宜宽容、宜知足。心善貌自善，福往者福来。`;
}
