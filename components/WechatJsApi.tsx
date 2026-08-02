"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    wx: any;
  }
}

interface Props {
  onReady?: () => void;
  onError?: (err: any) => void;
}

/** 微信 JSAPI 初始化组件，在需要的页面引入即可 */
export default function WechatJsApi({ onReady, onError }: Props) {
  useEffect(() => {
    // 加载微信 JS-SDK
    const script = document.createElement("script");
    script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
    script.async = true;
    script.onload = async () => {
      try {
        const res = await fetch("/api/wechat/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: window.location.href.split("#")[0] }),
        });
        const d = await res.json();
        if (d.error) { onError?.(d.error); return; }

        window.wx?.config({
          debug: false,
          appId: d.appId,
          timestamp: d.timestamp,
          nonceStr: d.nonceStr,
          signature: d.signature,
          jsApiList: [
            "chooseWXPay",
            "getLocation",
            "scanQRCode",
            "updateAppMessageShareData",
            "updateTimelineShareData",
          ],
        });

        window.wx?.ready(() => onReady?.());
        window.wx?.error((err: any) => onError?.(err));
      } catch (e) {
        onError?.(e);
      }
    };
    document.head.appendChild(script);
  }, [onReady, onError]);

  return null;
}
