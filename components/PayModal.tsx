"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Props {
  productName: string;
  amount: number; // 分
  onSuccess: () => void;
  onCancel: () => void;
}

function getGuestHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const r = localStorage.getItem("putiyuan_guest");
    if (r) {
      const g = JSON.parse(r);
      return { "x-guest-id": g.id, "x-guest-number": String(g.number) };
    }
  } catch {}
  return {};
}

export default function PayModal({ productName, amount, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<"select" | "paying" | "success">("select");
  const [qrUrl, setQrUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [payMethod, setPayMethod] = useState<"alipay" | "wechat">("alipay");
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 生成二维码图片
  useEffect(() => {
    if (qrUrl) {
      QRCode.toDataURL(qrUrl, { width: 220, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
        .then(setQrDataUrl)
        .catch(() => {});
    }
  }, [qrUrl]);

  // 轮询支付状态
  useEffect(() => {
    if (step === "paying" && orderId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/status?order_id=${orderId}`, {
            headers: getGuestHeaders(),
          });
          const d = await res.json();
          if (d.paid) {
            clearInterval(pollingRef.current!);
            setStep("success");
            setTimeout(onSuccess, 800);
          }
        } catch {}
      }, 2000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, orderId, onSuccess]);

  const handleCreate = async (method: "alipay" | "wechat") => {
    setLoading(true);
    setPayMethod(method);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getGuestHeaders() },
      body: JSON.stringify({ product_type: "single_bazi_deep", pay_method: method }),
    });
    const d = await res.json();
    setLoading(false);
    if (d.error) {
      alert(d.error);
      return;
    }
    setQrUrl(d.payment?.qr_url || "");
    setOrderId(d.payment?.order_id || d.order?.id || "");
    setStep("paying");
  };

  const handleManualConfirm = async () => {
    setLoading(true);
    const res = await fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getGuestHeaders() },
      body: JSON.stringify({ order_id: orderId }),
    });
    const d = await res.json();
    setLoading(false);
    if (d.success) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setStep("success");
      setTimeout(onSuccess, 800);
    } else alert(d.error || "支付失败");
  };

  const isSimulated = qrUrl.startsWith("alipays://") || qrUrl.startsWith("weixin://");

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-gold/30 bg-xuan-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 选择支付方式 */}
        {step === "select" && (
          <div className="space-y-4 text-center">
            <p className="text-gold font-semibold" style={{ fontFamily: "var(--font-calligraphy)" }}>
              功德随喜
            </p>
            <p className="text-sm text-paper-dark">{productName}</p>
            <p className="text-2xl text-gold font-bold">¥{(amount / 100).toFixed(2)}</p>

            <div className="space-y-2">
              <button
                onClick={() => handleCreate("alipay")}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
              >
                💙 支付宝支付
              </button>
              <button
                onClick={() => handleCreate("wechat")}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-500 transition-all flex items-center justify-center gap-2"
              >
                💚 微信支付
              </button>
            </div>

            <button onClick={onCancel} className="text-xs text-paper-muted hover:text-paper-dark">
              取消
            </button>
          </div>
        )}

        {/* 扫码支付中 */}
        {step === "paying" && (
          <div className="space-y-4 text-center">
            <p className="text-gold font-semibold">
              {payMethod === "alipay" ? "💙 支付宝扫码支付" : "💚 微信扫码支付"}
            </p>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="支付二维码"
                className="w-44 h-44 mx-auto rounded-xl border-2 border-gold/30 bg-white p-2"
              />
            ) : (
              <div className="w-44 h-44 mx-auto rounded-xl border-2 border-gold/30 bg-white flex items-center justify-center">
                <span className="text-sm text-paper-muted">加载二维码...</span>
              </div>
            )}

            <p className="text-xs text-paper-muted">
              {payMethod === "alipay"
                ? "请打开支付宝扫一扫"
                : "请打开微信扫一扫"}
            </p>

            {/* 仅模拟支付时显示手动确认按钮 */}
            {isSimulated && (
              <div className="border-t border-gold/20 pt-3">
                <p className="text-xs text-amber-400 mb-2">⚡ 开发模式 — 支付模拟</p>
                <button
                  onClick={handleManualConfirm}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-amber-600 text-white font-semibold text-sm hover:bg-amber-500 transition-all"
                >
                  {loading ? "处理中..." : "模拟支付成功"}
                </button>
              </div>
            )}

            <button onClick={onCancel} className="text-xs text-paper-muted hover:text-paper-dark block mx-auto">
              取消支付
            </button>
          </div>
        )}

        {/* 支付成功 */}
        {step === "success" && (
          <div className="space-y-4 text-center py-4">
            <p className="text-4xl">✅</p>
            <p className="text-gold font-semibold text-lg">支付成功</p>
            <p className="text-sm text-paper-muted">福生无量天尊 🙏</p>
          </div>
        )}
      </div>
    </div>
  );
}
