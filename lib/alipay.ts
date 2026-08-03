/**
 * 支付宝扫码支付 - 使用官方 alipay-sdk
 */

import { AlipaySdk } from "alipay-sdk";

function getSdk(): AlipaySdk {
  const privateKey = (process.env.ALIPAY_PRIVATE_KEY || "")
    .replace(/\\n/g, "\n")
    .replace(/"/g, "");
  const publicKey = (process.env.ALIPAY_PUBLIC_KEY || "")
    .replace(/\\n/g, "\n")
    .replace(/"/g, "");

  return new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID || "",
    privateKey,
    alipayPublicKey: publicKey,
    signType: "RSA2",
  });
}

interface PayResult {
  qr_code: string;
  out_trade_no: string;
}

export async function createAlipayOrder(
  outTradeNo: string,
  subject: string,
  totalAmount: string
): Promise<PayResult> {
  const sdk = getSdk();

  const result: any = await sdk.exec("alipay.trade.precreate", {
    bizContent: {
      out_trade_no: outTradeNo,
      product_code: "FAST_INSTANT_TRADE_PAY",
      subject,
      total_amount: totalAmount,
      qr_pay_mode: "2",
    },
    notifyUrl: process.env.ALIPAY_CALLBACK_URL || "",
  });

  if (result.code !== "10000") {
    throw new Error(
      `支付宝预下单失败: ${result.subMsg || result.msg} (${result.code})`
    );
  }

  return {
    qr_code: result.qrCode,
    out_trade_no: result.outTradeNo,
  };
}

export function verifyCallback(params: Record<string, string>): boolean {
  try {
    const sdk = getSdk();
    // alipay-sdk 内置验签方法
    const signStr = params.sign || "";
    const signType = params.sign_type || "RSA2";
    const signParams = { ...params };
    delete signParams.sign;
    delete signParams.sign_type;

    // 使用 sdk checkNotifySign
    return (sdk as any).checkNotifySign?.(signParams) ?? false;
  } catch {
    return false;
  }
}
