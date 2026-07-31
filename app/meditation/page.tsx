"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const TRACKS = [
  { icon: "🪷", title: "佛之境", file: "/audio/佛之境.mp3" },
  { icon: "🌿", title: "南无阿弥陀佛", file: "/audio/南无阿弥陀佛.mp3" },
  { icon: "🪷", title: "轻音乐", file: "/audio/蓮花處處開.mp3" },
  { icon: "🛶", title: "渡尘缘", file: "/audio/大慈大悲觀世音.mp3" },
  { icon: "🌅", title: "湖畔晨曦", file: "/audio/湖畔晨曦.mp3" },
  { icon: "🧘", title: "禅坐", file: "/audio/七佛滅罪真言.mp3" },
  { icon: "☯️", title: "禅意", file: "/audio/消災吉祥神咒 .mp3" },
  { icon: "🌕", title: "金刚经", file: "/audio/金刚经.mp3" },
  { icon: "🙏", title: "大悲咒", file: "/audio/大悲咒.mp3" },
  { icon: "📿", title: "心经", file: "/audio/心經 - 陳靜芳.mp3" },
];

const GUIDES = [
  { title: "十分钟入门", sub: "适合初学者", time: "10 分钟",
    steps: ["盘腿端坐，背挺直","深呼吸三次，吸气数 4 秒，呼气数 6 秒","把注意力放在鼻尖呼吸的进出","杂念升起时不评判，温柔回到呼吸","结束时双手合掌，回向众生"] },
  { title: "二十分钟正念", sub: "进阶练习", time: "20 分钟",
    steps: ["三下吐纳调息","观呼吸：注意力锁定鼻尖出入气","扫描身体：从头顶到脚趾，依次放松每一处","观念头来去：见妄念升起即知见，不跟随","回向：愿一切众生离苦得乐"] },
  { title: "南无阿弥陀佛", sub: "持名念佛", time: "15 分钟",
    steps: ["盘坐，掐念珠或合掌","心中默念或低声出声「南无阿弥陀佛」六字","字字分明、心心相续","杂念起，回到佛号","下座前合掌回向"] },
];

function getGuestHeaders(): Record<string,string> {
  if (typeof window==="undefined") return {};
  const raw = localStorage.getItem("putiyuan_guest");
  if (!raw) return {};
  try { const g = JSON.parse(raw); return {"x-guest-id":g.id,"x-guest-number":String(g.number)}; }
  catch { return {}; }
}

function formatTime(s: number): string {
  const m = Math.floor(s/60); const sec = s%60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}

export default function MeditationPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [toast, setToast] = useState("");
  const [paused, setPaused] = useState(false);
  const [hearts, setHearts] = useState<{id:number;left:number;delay:number}[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const meritRef = useRef(0);
  const heartId = useRef(0);

  const sendMerit = useCallback(async (pts: number) => {
    try {
      await fetch("/api/merit/record", {
        method:"POST", headers:{"Content-Type":"application/json",...getGuestHeaders()},
        body:JSON.stringify({incense_type:"禅修",merit_points:pts}),
      });
    } catch {}
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    clearTimers();
    setPlaying(null); setPaused(false);
    setCurrentTime(0); setDuration(0); setSeconds(0);
    startRef.current = 0; meritRef.current = 0;
    setToast("");
  }, [clearTimers]);

  // 播放时启动计时器（暂停时不重置）
  useEffect(() => {
    if (!playing || paused) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    startRef.current = Date.now() - seconds * 1000;
    meritRef.current = Math.floor(seconds / 30);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      setSeconds(elapsed);
      const newMerit = Math.floor(elapsed / 30);
      if (newMerit > meritRef.current) {
        const chunks = newMerit - meritRef.current;
        meritRef.current = newMerit;
        sendMerit(chunks * 30);
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, paused, sendMerit]);

  // 爱心
  useEffect(() => {
    if (!playing) { setHearts([]); return; }
    const iv = setInterval(() => {
      setHearts(prev => [...prev.slice(-30), ...Array.from({length:5},()=>({id:heartId.current++,left:Math.random()*100,delay:Math.random()*1.5}))]);
    }, 2000);
    return () => clearInterval(iv);
  }, [playing]);

  useEffect(() => {
    if (hearts.length > 30) setHearts(prev => prev.slice(-30));
  }, [hearts]);

  const handlePlay = (t: typeof TRACKS[0]) => {
    // 点击正在播放的歌曲 → 暂停/恢复
    if (playing === t.title) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
          setPaused(false);
          startRef.current = Date.now() - seconds * 1000;
        } else {
          audioRef.current.pause();
          setPaused(true);
        }
      }
      return;
    }
    // 切换歌曲
    if (playing) stopAll();
    setToast("");
    setPaused(false);
    setPlaying(t.title);
    setHearts([]);
  };

  const handleTimeUpdate = () => {
    const a = audioRef.current; if (!a) return;
    setCurrentTime(a.currentTime);
    if (!duration && a.duration) setDuration(a.duration);
  };

  const handleLoaded = () => {
    const a = audioRef.current; if (!a) return;
    setDuration(a.duration);
    a.volume = volume;
    a.play().catch(() => {});
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleEnd = () => {
    if (seconds < 30) {
      setToast("禅坐时间不足 30 秒，下次更专注一些～");
      return;
    }
    // 结算未领取的功德
    const unclaimed = Math.floor(seconds / 30) - meritRef.current;
    if (unclaimed > 0) sendMerit(unclaimed * 30);
    stopAll();
  };

  const track = TRACKS.find(t=>t.title===playing);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const totalMerit = Math.floor(seconds / 30) * 30;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pb-24 relative">
      {hearts.map(h=>(
        <span key={h.id} className="fixed pointer-events-none z-50 text-2xl"
          style={{left:`${h.left}%`,bottom:"-40px",animation:`heart-float 4s ease-out ${h.delay}s forwards`,opacity:0}}>❤️</span>
      ))}

      <section className="space-y-3 pt-6 text-center">
        <div className="relative mx-auto size-24">
          <div className="absolute inset-0 rounded-full bg-gold/15 blur-xl"/>
          <div className="relative flex size-24 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <span className="text-5xl">{playing ? "🔊" : "🪷"}</span>
          </div>
        </div>
        <h1 className="font-display text-4xl tracking-widest text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>静心禅坐</h1>
        <p className="text-base leading-relaxed text-paper-dark/85">一念心生 · 一念心灭 · 但有觉知 · 莫住莫离</p>
        <div className="mx-auto max-w-md rounded-xl border border-gold/30 bg-xuan-surface/40 px-4 py-3">
          <p className="font-display text-base text-paper" style={{fontFamily:"var(--font-calligraphy)"}}>「种善因，结善果」</p>
          <p className="mt-1 text-xs text-paper-dark/65">— 佛家箴言</p>
        </div>
      </section>

      {playing && track && (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{track.icon}</span>
            <div className="flex-1">
              <p className="text-gold font-semibold truncate">{track.title}</p>
              <p className="text-xs text-paper-muted">{formatTime(Math.floor(currentTime))} / {formatTime(Math.floor(duration))}</p>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e=>handleVolume(+e.target.value)} className="w-16 h-1 accent-gold"/>
          </div>

          <div className="w-full h-2 rounded-full bg-xuan-surface overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gold">累计禅修 <span className="text-lg font-bold">{formatTime(seconds)}</span></p>
              <p className="text-xs text-paper-muted mt-0.5">修够 30 秒 +30 功德 · 自动结算</p>
            </div>
            <div className="text-right">
              <p className="text-lg text-gold font-bold">{totalMerit}</p>
              <p className="text-xs text-paper-muted">功德</p>
            </div>
          </div>

          {/* 提示区（固定高度，避免布局抖动） */}
          <div className={`text-center text-sm rounded-lg py-2.5 border transition-all ${toast ? "text-gold/90 bg-gold/5 border-gold/20 opacity-100" : "border-transparent opacity-0"}`}>
            {toast || " "}
          </div>

          <div className="flex justify-end">
            <button onClick={handleEnd}
              className="px-6 py-2 rounded-full border border-vermillion/40 bg-vermillion text-white text-sm font-medium shadow-vermillion/20 hover:bg-vermillion-light transition-all">
              {seconds < 30 ? "结束修禅" : "结束本次修禅 · 结算功德"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-3">
        <h2 className="font-display text-xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>禅音曲库</h2>
        <p className="text-xs text-paper-dark/55">善缘堂专属 10 首禅修音乐 · 点击播放 · 修满30秒即可结算功德</p>
        <div className="grid gap-2 md:grid-cols-2">
          {TRACKS.map((t, i) => (
            <button key={i} onClick={() => handlePlay(t)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                playing===t.title ? "border-gold/60 bg-gold/10 shadow-gold" : "border-gold/15 bg-xuan-surface/40 hover:border-gold/40"}`}>
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-full border text-2xl ${
                playing===t.title ? "border-gold/60 animate-pulse-gold" : "border-gold/30"} bg-xuan-surface`}>{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate font-display text-base text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{t.title}</p>
                <p className="truncate text-xs text-paper-dark/85">禅修音乐</p>
              </div>
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-full border ${
                playing===t.title ? "bg-gold/20 border-gold/60 text-gold" : "border-gold/30 text-gold"}`}>
                {playing===t.title && !paused ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-3">
        <h2 className="font-display text-xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>禅修引导</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <div key={i} className="rounded-xl border border-gold/20 bg-xuan-surface/40 p-4">
              <p className="font-display text-lg text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{g.title}</p>
              <p className="mt-1 text-xs text-paper-dark/85">{g.sub}</p>
              <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium border-gold/30 bg-gradient-to-r from-gold/20 to-gold/5 text-gold-dark mt-2">{g.time}</span>
              <ol className="mt-3 space-y-1.5 text-sm text-paper-dark/85">
                {g.steps.map((s, j) => (
                  <li key={j} className="flex gap-2"><span className="shrink-0 text-gold">{j+1}.</span><span>{s}</span></li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {playing && track && (
        <audio ref={audioRef} src={track.file} preload="auto"
          onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoaded}/>
      )}

      <style jsx>{`
        @keyframes heart-float {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          10% { opacity: 0.9; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
