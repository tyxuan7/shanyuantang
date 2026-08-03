"use client";

import { useState } from "react";

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
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    // 创建订单并标记已支付
    const res1 = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getGuestHeaders() },
      body: JSON.stringify({ product_type: "single_bazi_deep", pay_method: "manual" }),
    });
    const d1 = await res1.json();
    const orderId = d1.payment?.order_id || d1.order?.id;

    if (orderId) {
      await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getGuestHeaders() },
        body: JSON.stringify({ order_id: orderId }),
      });
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-gold/30 bg-xuan-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-5 text-center">
          {/* 标题 */}
          <div>
            <p className="text-gold font-semibold" style={{ fontFamily: "var(--font-calligraphy)" }}>
              功德随喜
            </p>
            <p className="text-sm text-paper-dark mt-1">{productName}</p>
            <p className="text-2xl text-gold font-bold mt-2">¥{(amount / 100).toFixed(2)}</p>
          </div>

          {/* 二维码 */}
          <div>
            <img
              src="/qrcode/contact.jpg"
              alt="添加好友支付"
              className="w-52 h-52 mx-auto rounded-xl border-2 border-gold/30 bg-white"
            />
            <p className="text-xs text-paper-muted mt-2">
              请扫码添加好友后转账支付
            </p>
          </div>

          {/* 说明 */}
          <div className="border-t border-gold/20 pt-4 text-left text-xs text-paper-muted space-y-1">
            <p>1. 截图保存二维码</p>
            <p>2. 打开微信添加好友</p>
            <p>3. 发送 ¥{(amount / 100).toFixed(2)} 并备注「{productName}」</p>
            <p>4. 确认收款后点击下方按钮</p>
          </div>

          {/* 按钮 */}
          <div className="space-y-2">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-red-700 tracking-wider text-white font-semibold text-sm hover:bg-red-600 transition-all"
            >
              {loading ? "处理中..." : "已支付，确认开通"}
            </button>
            <button onClick={onCancel} className="text-xs text-paper-muted hover:text-paper-dark block mx-auto">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
