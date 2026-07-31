"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const PRODUCTS = [
  { id: "single_bazi_deep", name: "八字精批深度版", amount: 2990, desc: "包含完整八字排盘、五行分析、事业/财运/婚姻详解" },
  { id: "single_bazi_lite", name: "八字精批简版", amount: 990, desc: "八字排盘 + 命格总评，适合初步了解" },
  { id: "naming_premium", name: "起名高级版", amount: 3990, desc: "5个候选名字 + 五行详解 + 八字喜用神分析" },
  { id: "naming_basic", name: "起名基础版", amount: 1990, desc: "3个候选名字 + 五行分析" },
  { id: "year_luck", name: "流年运势", amount: 1990, desc: "十二个月逐月运势详解" },
  { id: "dream_premium", name: "深度解梦", amount: 990, desc: "AI结合周公解梦进行深度分析" },
];

export default function PaymentPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"wechat">("wechat");
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ qr_url: string; amount_yuan: string; order_id: string; method: string } | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const getGuestHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem("putiyuan_guest");
    if (!raw) return {};
    try {
      const g = JSON.parse(raw);
      return { "x-guest-id": g.id as string, "x-guest-number": String(g.number) };
    } catch { return {}; }
  };

  const handleCreateOrder = async () => {
    if (!selected) return;
    setLoading(true);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getGuestHeaders() },
      body: JSON.stringify({ product_type: selected, pay_method: payMethod }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { alert(data.error); return; }
    setPaymentResult(data.payment);
  };

  const handleConfirmPay = async () => {
    if (!paymentResult) return;
    setLoading(true);
    const res = await fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getGuestHeaders() },
      body: JSON.stringify({ order_id: paymentResult.order_id }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) { setPaySuccess(true); setPaymentResult(null); }
    else alert(data.error || "支付失败");
  };

  const product = PRODUCTS.find(p => p.id === selected);

  return (
    <div className="animate-fade-in">
      <PageHeader icon="💰" title="功德随喜" subtitle="心诚则灵，随喜功德，福生无量" />
      <div className="mx-auto max-w-lg space-y-4">
        {!paymentResult && !paySuccess && (
          <>
            <div className="space-y-2">
              {PRODUCTS.map(p => (
                <button key={p.id} onClick={() => setSelected(p.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${selected === p.id ? "border-gold bg-gold/5 shadow-gold" : "border-gold-subtle bg-xuan-card/95 hover:border-gold/30"}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-paper font-semibold">{p.name}</span>
                    <span className="text-sm text-gold font-semibold">¥{(p.amount/100).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-paper-muted mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
            {selected && (
              <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-4 shadow-gold">
                <h3 className="text-sm text-paper-dark mb-3">选择支付方式</h3>
                <div className="flex items-center gap-2 py-2 text-green-400">
                  <span>💚</span><span className="text-sm">微信支付</span>                </div>
                <button onClick={handleCreateOrder} disabled={loading}
                  className="w-full mt-4 py-3 rounded-lg bg-gold text-xuan font-semibold text-sm hover:bg-gold-light transition-all">
                  {loading ? "创建订单中..." : `确认支付 ¥${product ? (product.amount/100).toFixed(2) : ""}`}
                </button>
              </div>
            )}
          </>
        )}
        {paymentResult && (
          <div className="rounded-xl border border-gold/30 bg-xuan-card/95 p-6 shadow-gold text-center animate-slide-up">
            <h3 className="text-sm text-gold mb-2">{paymentResult.method === "wechat" ? "💚 微信扫码支付" : "💚 微信扫码支付"}</h3>
            <p className="text-2xl text-paper font-bold mb-4">¥{paymentResult.amount_yuan}</p>
            <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center mb-4 border-2 border-gold/30">
              <div className="text-6xl">{paymentResult.method === "wechat" ? "💚" : "💙"}</div>
            </div>
            <p className="text-xs text-paper-muted mb-2">订单号: {paymentResult.order_id.slice(0,16)}...</p>
            <div className="flex gap-3">
              <button onClick={() => setPaymentResult(null)} className="flex-1 py-2.5 rounded-lg border border-gold-subtle text-paper-muted text-sm">取消</button>
              <button onClick={handleConfirmPay} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-500 transition-all">{loading ? "处理中..." : "模拟支付成功"}</button>
            </div>
          </div>
        )}
        {paySuccess && (
          <div className="rounded-xl border border-gold/30 bg-xuan-card/95 p-8 shadow-gold text-center animate-slide-up">
            <div className="text-5xl mb-4">🙏</div>
            <h3 className="text-lg text-gradient-gold mb-2" style={{ fontFamily: "var(--font-calligraphy)" }}>功德圆满</h3>
            <p className="text-sm text-paper-dark mb-2">支付成功！感恩您的随喜功德。</p>
            <button onClick={() => { setPaySuccess(false); setSelected(null); }} className="px-6 py-2.5 rounded-full border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-all">返回</button>
          </div>
        )}
      </div>
    </div>
  );
}
