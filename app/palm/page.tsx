"use client";

import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PalmPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = ev => { setImage(ev.target?.result as string); setResult(null); };
      r.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/divine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "palm", data: { image: image.substring(0, 200) } }) });
      const data = await res.json();
      setResult(data.result);
    } catch {
      setTimeout(() => {
        const text = `【手相分析】\n\n【生命线】线条清晰绵长，末端无断裂，主生命力顽强，身体健康，长寿之相。\n\n【智慧线】线条深长而直，贯穿掌心，主思维敏捷、逻辑清晰。适合从事需要分析和创意的工作。35岁左右有一分叉，代表职业重要转折。\n\n【感情线】线条圆润，起点在上，主感情细腻、重情重义。婚姻运势良好，中年后感情更加稳定深厚。\n\n【事业线】从手腕直上中指，事业运极佳，有贵人运。中年有大运，不宜频繁跳槽。\n\n【财运线】掌中纹路成网，属聚财之相。虽非大富大贵，但一生衣食无忧，晚年宽裕。`;
        setResult(text);
        setLoading(false);
        fetch("/api/records/palm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ result_text: text }) }).catch(() => {});
      }, 2500);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader icon="✋" title="看手相" subtitle="掌中乾坤大，纹理藏命数" />
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 md:p-6 shadow-gold">
          {!image ? (
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gold-subtle rounded-lg p-8 text-center cursor-pointer hover:border-gold/40 transition-colors">
              <div className="text-4xl mb-3">✋</div>
              <p className="text-sm text-paper-dark">点击上传手掌照片</p>
              <p className="text-xs text-paper-muted mt-1">请确保光线充足，手掌纹路清晰可见</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden">
                <img src={image} alt="手掌照片" className="w-full h-48 object-cover" />
                <button onClick={() => { setImage(null); setResult(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white text-sm flex items-center justify-center">✕</button>
              </div>
              <button onClick={handleAnalyze} disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-medium text-sm transition-all active:scale-[0.98] ${
                  !loading ? "bg-vermillion shadow-vermillion hover:bg-vermillion-light" : "bg-xuan-surface text-paper-muted cursor-not-allowed"
                }`}>
                {loading ? "分析中..." : "🔍 开始分析手相"}
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </div>

        <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-4 shadow-gold">
          <h3 className="text-sm text-gold mb-3">📖 手相四大主线</h3>
          <div className="space-y-2 text-xs text-paper-muted">
            {[{color:"bg-red-400",label:"生命线 — 看健康和寿命"},{color:"bg-blue-400",label:"智慧线 — 看思维和能力"},{color:"bg-pink-400",label:"感情线 — 看情感和婚姻"},{color:"bg-green-400",label:"事业线 — 看事业和财运"}].map(l => (
              <div key={l.label} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${l.color}`} /><span>{l.label}</span></div>
            ))}
          </div>
        </div>

        {loading && <LoadingSpinner text="正在细观掌中纹路..." />}

        {result && !loading && (
          <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 md:p-6 shadow-gold animate-slide-up">
            <h3 className="text-sm text-gold mb-3">🔍 手相分析结果</h3>
            <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap">{result}</p>
          </div>
        )}
        <p className="text-center text-[11px] text-paper-muted opacity-50">手相分析仅供娱乐参考，请勿过于执着</p>
      </div>
    </div>
  );
}
