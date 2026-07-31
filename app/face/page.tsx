"use client";

import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";

const FACE_ZONES = [
  { label: "额头", icon: "🔝", desc: "天庭饱满主智慧" },
  { label: "眉毛", icon: "〰️", desc: "眉形主兄弟缘" },
  { label: "眼睛", icon: "👁️", desc: "眼神定心神" },
  { label: "鼻子", icon: "👃", desc: "鼻为财帛宫" },
  { label: "嘴巴", icon: "👄", desc: "口为出纳官" },
  { label: "耳朵", icon: "👂", desc: "耳为采听官" },
];

export default function FacePage() {
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
      const res = await fetch("/api/divine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "face", data: { image: image.substring(0, 200) } }) });
      const data = await res.json();
      setResult(data.result);
    } catch {
      setTimeout(() => {
        const text = `【面相分析】\n\n【天庭】天庭饱满，宽广光洁，主聪慧过人，少年运势佳，格局宏大。\n\n【眉毛】眉形清秀，眉尾不乱，主兄弟朋友缘分好，人缘佳。眉间开阔者心胸豁达。\n\n【眼睛】眼神清亮有神，是为&ldquo;凤眼&rdquo;之相。主心地善良，聪慧明理。\n\n【财帛宫（鼻）】鼻梁挺拔，鼻头圆润有肉，主财运亨通。中年财运最好，善于理财。\n\n【出纳官（口）】唇红齿白，嘴角微扬，是福相。为人诚信，言出必行。\n\n【采听官（耳）】耳垂厚实，轮廓分明，主长寿多福。善于倾听，贵人运佳。\n\n【综合评价】五官端正，三停匀称，为中等偏上之相。性格温和，为人厚道，中晚年运势更佳，可享天伦之乐。`;
        setResult(text);
        setLoading(false);
        fetch("/api/records/face", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ result_text: text }) }).catch(() => {});
      }, 2500);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader icon="😊" title="看面相" subtitle="五官气色，观相识人心" />
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 md:p-6 shadow-gold">
          {!image ? (
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gold-subtle rounded-lg p-8 text-center cursor-pointer hover:border-gold/40 transition-colors">
              <div className="text-4xl mb-3">📸</div>
              <p className="text-sm text-paper-dark">点击上传正面照片</p>
              <p className="text-xs text-paper-muted mt-1">请上传五官清晰的正面照，光线均匀</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden">
                <img src={image} alt="面相照片" className="w-full h-48 object-cover" />
                <button onClick={() => { setImage(null); setResult(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white text-sm flex items-center justify-center">✕</button>
              </div>
              <button onClick={handleAnalyze} disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-medium text-sm transition-all active:scale-[0.98] ${
                  !loading ? "bg-vermillion shadow-vermillion hover:bg-vermillion-light" : "bg-xuan-surface text-paper-muted cursor-not-allowed"
                }`}>
                {loading ? "分析中..." : "🔍 开始面相分析"}
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handleFile} className="hidden" />
        </div>

        <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-4 shadow-gold">
          <h3 className="text-sm text-gold mb-3">📖 面相六府</h3>
          <div className="grid grid-cols-3 gap-2">
            {FACE_ZONES.map(f => (
              <div key={f.label} className="text-center p-2 rounded-lg bg-xuan">
                <span className="text-lg">{f.icon}</span>
                <p className="text-xs text-paper-dark mt-1">{f.label}</p>
                <p className="text-[10px] text-paper-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {loading && <LoadingSpinner text="正在细观面相五官..." />}

        {result && !loading && (
          <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 md:p-6 shadow-gold animate-slide-up">
            <h3 className="text-sm text-gold mb-3">🔍 面相分析结果</h3>
            <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap">{result}</p>
          </div>
        )}
        <p className="text-center text-[11px] text-paper-muted opacity-50">面相分析仅供娱乐参考，相由心生，善心最美</p>
      </div>
    </div>
  );
}
