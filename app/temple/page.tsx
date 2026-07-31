"use client";

import { useState, useCallback, useEffect } from "react";

const OFFER_COUNT = 3;
const STICKS_PER_OFFER = 3;
const TOTAL_STICKS = OFFER_COUNT * STICKS_PER_OFFER;
const MERIT_PER_OFFER = 5;

const INCENSE_TYPES = [
  { id: "檀香", name: "檀香", desc: "香气醇厚，安神静心", icon: "🪵" },
  { id: "沉香", name: "沉香", desc: "香气清雅，通灵开慧", icon: "🪨" },
  { id: "安神香", name: "安神香", desc: "香气温和，助眠养心", icon: "🌿" },
];

function stickCx(idx: number): number {
  return [137.78,143.33,148.89,154.44,160,165.56,171.11,176.67,182.22][idx] ?? 160;
}
function stickHeight(idx: number): number {
  return 116 + (idx%3-1)*4;
}
function stickAngle(idx: number): number {
  return [-1.5,-1.125,-0.75,-0.375,0,0.375,0.75,1.125,1.5][idx] ?? 0;
}

function generateSmoke() {
  return Array.from({length:45},()=>({
    left:`${42+Math.random()*18}%`,top:`${32+Math.random()*2}%`,
    width:6+Math.random()*9,height:16+Math.random()*22,
    duration:6000+Math.random()*2200,delay:Math.random()*200,
  }));
}

function getGuestHeaders(): Record<string,string> {
  if(typeof window==="undefined") return {};
  const raw = localStorage.getItem("putiyuan_guest");
  if (!raw) return {};
  try { const g = JSON.parse(raw); return {"x-guest-id":g.id,"x-guest-number":String(g.number)}; }
  catch { return {}; }
}

export default function TemplePage() {
  const [round, setRound] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [smoke, setSmoke] = useState<any[]>([]);
  const [smokeId, setSmokeId] = useState(0);
  const [incenseType, setIncenseType] = useState("檀香");
  const [totalMerit, setTotalMerit] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayDone, setTodayDone] = useState(false);

  // 初始化：查询今天已完成的礼数，同步香炉状态
  useEffect(()=>{
    fetch("/api/merit/today",{headers:getGuestHeaders()})
      .then(r=>r.json())
      .then(d=>{
        if(d.rounds>0){
          setRound(d.rounds);
          setTotalMerit(d.total_merit||0);
          // 已上香则显示烟雾特效
          setSmoke(generateSmoke());
          setSmokeId(prev=>prev+1);
        }
        if(d.done) setTodayDone(true);
      }).catch(()=>{});
  },[]);

  useEffect(()=>{
    fetch("/api/merit/leaderboard",{headers:getGuestHeaders()})
      .then(r=>r.json()).then(d=>{setLeaderboard(d.board||[]);setMyRank(d.myRank||0);setTotalUsers(d.total||0);}).catch(()=>{});
  },[round]);

  const handleOffer = useCallback(async () => {
    if (animating || round >= OFFER_COUNT || todayDone) return;
    setAnimating(true);
    setSmoke(generateSmoke());
    setSmokeId(prev=>prev+1);

    try {
      const res = await fetch("/api/merit/record", {
        method:"POST",
        headers:{"Content-Type":"application/json",...getGuestHeaders()},
        body:JSON.stringify({incense_type:incenseType}),
      });
      const d = await res.json();
      if (d.error === "今日已圆满，明日再来") {
        setTodayDone(true);
        setAnimating(false);
        return;
      }
      if (d.total_merit) setTotalMerit(d.total_merit);
    } catch {}

    const next = round + 1;
    setRound(next);
    setTimeout(()=>setAnimating(false), 1500);
  },[round,animating,todayDone,incenseType]);

  const completed = round >= OFFER_COUNT || todayDone;
  const litCount = round * STICKS_PER_OFFER;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24" style={{marginTop:"3.5rem"}}>
      <section className="space-y-3 pt-8 text-center">
        <h1 className="text-4xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>在线上香</h1>
        <p className="text-base text-paper-dark/80">心诚则灵，每日最多三礼，每礼三炷清香。</p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* 香炉 */}
        <div className="mx-auto w-full max-w-[420px]">
          <div className="relative w-full overflow-hidden rounded-3xl border border-gold/25 shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
            style={{aspectRatio:"320/480",backgroundImage:"url('/temple/temple-mountain.svg'), radial-gradient(at 50% 80%, rgb(42,24,8) 0%, rgb(10,6,4) 70%)",backgroundSize:"cover",backgroundPosition:"center"}}>

            <div className="absolute left-3 top-3 z-30 rounded-full border border-gold/40 bg-black/75 px-3 py-1 text-[11px] tracking-[0.28em] text-gold/95">三礼九炷</div>
            <div className="absolute right-3 top-3 z-30 rounded-full border border-gold/40 bg-black/75 px-3 py-1 text-xs text-paper-dark/95">{round}/{OFFER_COUNT} 礼</div>

            <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="bronze-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5a3818"/><stop offset="15%" stopColor="#a87142"/><stop offset="40%" stopColor="#d4a464"/><stop offset="55%" stopColor="#a87142"/><stop offset="80%" stopColor="#6b3f1c"/><stop offset="100%" stopColor="#3a2310"/>
                </linearGradient>
                <linearGradient id="bronze-shine" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0%" stopColor="rgba(255,230,180,0.4)"/><stop offset="50%" stopColor="rgba(255,230,180,0)"/>
                </linearGradient>
                <linearGradient id="gold-rim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde68a"/><stop offset="50%" stopColor="#c9a05c"/><stop offset="100%" stopColor="#7c4f1a"/>
                </linearGradient>
                <radialGradient id="ash" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#d4cabc"/><stop offset="60%" stopColor="#8d8473"/><stop offset="100%" stopColor="#3a3528"/>
                </radialGradient>
                <linearGradient id="inc-stick" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff5d8"/><stop offset="3%" stopColor="#ffb88c"/><stop offset="8%" stopColor="#a8632d"/><stop offset="100%" stopColor="#6b3f1c"/>
                </linearGradient>
                <radialGradient id="ember">
                  <stop offset="0%" stopColor="#fff"/><stop offset="30%" stopColor="#ffe98c"/><stop offset="60%" stopColor="#ff7e2a"/><stop offset="100%" stopColor="#ff4500" stopOpacity="0"/>
                </radialGradient>
              </defs>
              {Array.from({length:TOTAL_STICKS}).map((_,i)=>{
                const lit = i < litCount;
                const cx = stickCx(i), h = stickHeight(i), angle = stickAngle(i);
                const flameDur = `${1100 + (i%3)*200}ms`;
                return (
                  <g key={i} transform={`translate(${cx},276) rotate(${angle})`}
                    style={lit&&animating?{animation:"stick-shake-v7 0.18s ease-in-out 4"}:{}}>
                    <rect x="-1.1" y={-h} width="2.2" height={h} rx="1" fill={lit?"url(#inc-stick)":"#5a3818"} opacity={lit?1:0.5}/>
                    {lit && <>
                      <circle cx="0" cy={-(h-1)} r="5.4" fill="url(#ember)" opacity="0.78"
                        style={{animation:`flame-pulse-v7 ${flameDur} ease-in-out infinite`,transformOrigin:`0px ${-(h-1)}px`}}/>
                      <circle cx="0" cy={-(h-1)} r="1.8" fill="#fff7c0" style={{filter:"drop-shadow(rgb(255,126,42) 0 0 3px)"}}/>
                    </>}
                  </g>
                );
              })}
              <g style={animating?{animation:"burner-shake-v7 0.5s ease-in-out",transformOrigin:"160px 380px"}:{}}>
                <ellipse cx="160" cy="452" rx="108" ry="8" fill="rgba(0,0,0,0.6)"/>
                {[100,160,220].map((x,i)=><path key={i} d={`M ${x} 420 L ${x-6} 448 L ${x+14} 448 Z`} fill="url(#bronze-body)"/>)}
                <path d="M 80 270 Q 80 416 100 430 L 220 430 Q 240 416 240 270 Z" fill="url(#bronze-body)" stroke="#3a2310" strokeWidth="1.5"/>
                <path d="M 88 276 Q 92 404 105 424 L 130 424 Q 116 404 110 276 Z" fill="url(#bronze-shine)"/>
                <path d="M 70 240 Q 56 248 56 270 Q 56 294 70 302 L 82 294 Q 74 286 74 272 Q 74 256 82 248 Z" fill="url(#bronze-body)" stroke="#3a2310" strokeWidth="1"/>
                <path d="M 250 240 Q 264 248 264 270 Q 264 294 250 302 L 238 294 Q 246 286 246 272 Q 246 256 238 248 Z" fill="url(#bronze-body)" stroke="#3a2310" strokeWidth="1"/>
                <rect x="75" y="262" width="170" height="12" rx="3" fill="url(#gold-rim)" stroke="#3a2310" strokeWidth="1"/>
                <rect x="88" y="350" width="144" height="1.5" fill="#7c4f1a" opacity="0.6"/>
                <rect x="92" y="385" width="136" height="1" fill="#7c4f1a" opacity="0.5"/>
                <ellipse cx="160" cy="276" rx="82" ry="10" fill="url(#ash)"/>
                <ellipse cx="160" cy="274" rx="74" ry="5" fill="rgba(60,50,38,0.5)"/>
                <g transform="translate(160,374)">
                  <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#a82318" stroke="#fcd34d" strokeWidth="2"/>
                  <text x="0" y="9" textAnchor="middle" fontSize="28" fontFamily="STKaiti,KaiTi,serif" fontWeight="bold" fill="#fcd34d">福</text>
                </g>
              </g>
            </svg>

            {smoke.length > 0 && (
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" key={smokeId}>
                {smoke.map((p,i)=>(
                  <span key={i} className="absolute block rounded-full"
                    style={{left:p.left,top:p.top,width:`${p.width}px`,height:`${p.height}px`,
                      animation:`smoke-particle-v7 ${p.duration}ms ease-out ${p.delay}ms forwards`}}>
                    <span className="block h-full w-full rounded-full"
                      style={{background:"radial-gradient(at 50% 45%, rgba(245,238,220,0.72) 0%, rgba(224,216,200,0.3) 46%, rgba(224,216,200,0) 78%)",filter:"blur(2px)"}}/>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧 */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper text-center space-y-4">
            <h2 className="text-xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>敬香礼仪</h2>
            <div className="space-y-3 text-left text-sm text-paper-dark/80">
              {[{n:1,label:"一礼",desc:"为父母长辈祈福，愿健康长寿"},{n:2,label:"二礼",desc:"为自己及伴侣祈福，愿平安顺遂"},{n:3,label:"三礼",desc:"为子孙后代祈福，愿福慧双增"}].map(r=>(
                <div key={r.n} className={`flex gap-3 p-2 rounded-lg transition-colors ${round>=r.n?"bg-gold/10":""}`}>
                  <span className="text-gold font-bold shrink-0">{r.label}</span>
                  <span>{r.desc} {round>=r.n?"✅":""}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 选香类型 — 今日已圆满时隐藏 */}
          {!completed && (
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper space-y-3">
            <p className="text-sm text-paper-dark/70">选择香品</p>
            <div className="grid grid-cols-3 gap-2">
              {INCENSE_TYPES.map(t=>(
                <button key={t.id} onClick={()=>setIncenseType(t.id)}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    incenseType===t.id?"border-gold/60 bg-gold/10":"border-gold/20 bg-xuan-surface/40 hover:border-gold/40"
                  }`}>
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <p className={`text-sm font-semibold ${incenseType===t.id?"text-gold":"text-paper-dark"}`}>{t.name}</p>
                  <p className="text-[11px] text-paper-muted mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>

            {/* 功德值 */}
            <div className="text-center pt-2">
              <p className="text-lg text-gold font-bold">{totalMerit} <span className="text-sm text-paper-muted">功德</span></p>
              <p className="text-xs text-paper-muted mt-1">一礼三炷清香，记 {MERIT_PER_OFFER} 点功德</p>
              <p className="text-xs text-paper-muted">香火不在多，在心念端正、持之以恒</p>
            </div>
          </div>

          )}
          {/* 按钮 */}
          <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper text-center space-y-3">
            {completed ? (
              <>
                <p className="text-lg text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>今日已圆满</p>
                <p className="text-sm text-paper-muted">心诚则灵，福生无量天尊</p>
              </>
            ) : (
              <>
                <p className="text-sm text-paper-muted">{round===0?"每日三礼，每礼三炷":`已敬 ${round}/${OFFER_COUNT} 礼`}</p>
                <button onClick={handleOffer} disabled={animating}
                  className="px-8 py-3 rounded-lg bg-vermillion text-white font-medium text-sm shadow-vermillion/20 hover:bg-vermillion-light transition-all disabled:opacity-50">
                  {animating?"敬香中...":`敬上三炷${incenseType}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 功德排行榜 */}
      <div className="mt-8 rounded-lg border border-gold/20 bg-xuan-card/95 shadow-paper overflow-hidden">
        <div className="sticky top-0 flex items-center justify-between border-b border-gold/10 bg-xuan-card/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-sm text-paper-dark/70">我的功德排名</p>
            <p className="font-display text-lg text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>
              {myRank>0?`第 ${myRank} 位`:"暂无排名"}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium border-gold/30 bg-gradient-to-r from-gold/20 to-gold/5 text-gold-dark">
            累计 {totalUsers} 位善信
          </span>
        </div>
        <div className="divide-y divide-gold/10">
          {leaderboard.map((r:any)=>(
            <div key={r.rank} className="flex items-center gap-3 px-4 py-3">
              <span className="font-display text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>#{r.rank}</span>
              <span className="flex-1 text-paper-dark">{r.name}</span>
              <span className="font-mono text-gold">{r.merit} 功德</span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium border-gold/30 bg-gradient-to-r from-gold/20 to-gold/5 text-gold-dark">{r.title}</span>
            </div>
          ))}
          {leaderboard.length===0 && <div className="px-4 py-8 text-center text-sm text-paper-muted">暂无功德记录，来做第一位善信吧 🙏</div>}
        </div>
      </div>

      <style jsx>{`
        @keyframes smoke-particle-v7 {
          0%   { transform: translate(-50%,-50%) translate(0,0) scale(0.45); opacity: 0; }
          16%  { opacity: 0.32; }
          62%  { opacity: 0.17; }
          100% { transform: translate(-50%,-50%) translate(0px,-100px) scale(3.3); opacity: 0; }
        }
        @keyframes flame-pulse-v7 {
          0%,100% { opacity: 0.85; transform: scale(1); }
          50%     { opacity: 1;    transform: scale(1.3); }
        }
        @keyframes burner-shake-v7 {
          0%,100% { transform: translateX(0) rotate(0); }
          20%     { transform: translateX(-3px) rotate(-1deg); }
          40%     { transform: translateX(3px) rotate(1deg); }
          60%     { transform: translateX(-2px) rotate(-0.5deg); }
          80%     { transform: translateX(2px) rotate(0.5deg); }
        }
        @keyframes stick-shake-v7 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
