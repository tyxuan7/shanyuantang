"use client";

import { useState } from "react";

interface Props {
  productName: string;
  amount: number; // 分
  onSuccess: () => void;
  onCancel: () => void;
}

function getGuestHeaders(): Record<string,string> {
  if(typeof window==="undefined") return {};
  try{const r=localStorage.getItem("putiyuan_guest");if(r){const g=JSON.parse(r);return{"x-guest-id":g.id,"x-guest-number":String(g.number)};}}catch{}
  return {};
}

export default function PayModal({ productName, amount, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<"select"|"paying"|"success">("select");
  const [qrUrl, setQrUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const res = await fetch("/api/payment/create",{
      method:"POST",headers:{"Content-Type":"application/json",...getGuestHeaders()},
      body:JSON.stringify({product_type: "single_bazi_deep", pay_method: "wechat"}),
    });
    const d = await res.json();
    setLoading(false);
    if (d.error) { alert(d.error); return; }
    setQrUrl(d.payment?.qr_url || "");
    setOrderId(d.payment?.order_id || d.order?.id || "");
    setStep("paying");
  };

  const handleConfirm = async () => {
    setLoading(true);
    const res = await fetch("/api/payment/confirm",{
      method:"POST",headers:{"Content-Type":"application/json",...getGuestHeaders()},
      body:JSON.stringify({order_id: orderId}),
    });
    const d = await res.json();
    setLoading(false);
    if (d.success) { setStep("success"); setTimeout(onSuccess, 800); }
    else alert(d.error||"支付失败");
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
      <div className="relative w-full max-w-sm rounded-2xl border border-gold/30 bg-xuan-card p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
        {step==="select" && (
          <div className="space-y-4 text-center">
            <p className="text-gold font-semibold" style={{fontFamily:"var(--font-calligraphy)"}}>功德随喜</p>
            <p className="text-sm text-paper-dark">{productName}</p>
            <p className="text-2xl text-gold font-bold">¥{(amount/100).toFixed(2)}</p>
            <div className="flex items-center justify-center gap-2 py-2 text-green-400 text-sm">
              <span>💚</span><span>微信支付</span>
            </div>
            <button onClick={handleCreate} disabled={loading}
              className="w-full py-3 rounded-lg bg-gold text-xuan font-semibold text-sm hover:bg-gold-light transition-all">{loading?"创建中...":"确认支付"}</button>
            <button onClick={onCancel} className="text-xs text-paper-muted hover:text-paper-dark">取消</button>
          </div>
        )}
        {step==="paying" && (
          <div className="space-y-4 text-center">
            <p className="text-gold font-semibold">💚 微信扫码支付</p>
            <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center border-2 border-gold/30">
              <span className="text-5xl">💚</span>
            </div>
            <p className="text-xs text-paper-muted mb-2">开发环境模拟支付</p>
            <button onClick={handleConfirm} disabled={loading}
              className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-500 transition-all">{loading?"处理中...":"模拟支付成功"}</button>
            <button onClick={onCancel} className="text-xs text-paper-muted hover:text-paper-dark">取消</button>
          </div>
        )}
      </div>
    </div>
  );
}
