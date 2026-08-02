/**
 * 支付宝电脑网站支付 / 扫码支付
 * 环境变量: ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY
 */

import crypto from "crypto";

const APP_ID = process.env.ALIPAY_APP_ID || "";
const PRIVATE_KEY = (process.env.ALIPAY_PRIVATE_KEY || "").replace(/\\n/g, "\n").replace(/"/g, "");
const PUBLIC_KEY = (process.env.ALIPAY_PUBLIC_KEY || "").replace(/\\n/g, "\n").replace(/"/g, "");
const GATEWAY = "https://openapi.alipay.com/gateway.do";
const CALLBACK_URL = process.env.ALIPAY_CALLBACK_URL || "https://shanyuantang.vercel.app/api/payment/alipay-callback";

interface PayResult {
  qr_code: string;     // 二维码链接
  out_trade_no: string; // 商户订单号
}

function sign(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort();
  const raw = sorted.filter(k => params[k] && k !== "sign" && k !== "sign_type")
    .map(k => `${k}=${params[k]}`).join("&");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(raw);
  return sign.sign(PRIVATE_KEY, "base64");
}

function verifySign(params: Record<string, string>): boolean {
  const signStr = params.sign || "";
  const sorted = Object.keys(params).sort();
  const raw = sorted.filter(k => params[k] && k !== "sign" && k !== "sign_type")
    .map(k => `${k}=${params[k]}`).join("&");
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(raw);
  return verify.verify(PUBLIC_KEY, signStr, "base64");
}

/** 创建预下单 → 返回支付二维码 */
export async function createAlipayOrder(
  outTradeNo: string,
  subject: string,
  totalAmount: string
): Promise<PayResult> {
  const bizContent = JSON.stringify({
    out_trade_no: outTradeNo,
    product_code: "FAST_INSTANT_TRADE_PAY",
    subject,
    total_amount: totalAmount,
    qr_pay_mode: "2", // 扫码支付模式
  });

  const params: Record<string, string> = {
    app_id: APP_ID,
    method: "alipay.trade.precreate",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    version: "1.0",
    notify_url: CALLBACK_URL,
    biz_content: bizContent,
  };

  params.sign = sign(params);

  const formBody = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody,
  });

  const text = await res.text();
  const result = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  const response = result.alipay_trade_precreate_response;
  if (response.code !== "10000") {
    throw new Error(`支付宝预下单失败: ${response.sub_msg || response.msg}`);
  }

  return {
    qr_code: response.qr_code,
    out_trade_no: response.out_trade_no,
  };
}

/** 验证回调签名 */
export function verifyCallback(params: Record<string, string>): boolean {
  return verifySign(params);
}
