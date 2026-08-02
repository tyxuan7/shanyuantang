/**
 * 微信 JSAPI 签名服务
 * 需要设置环境变量: WECHAT_APP_ID, WECHAT_APP_SECRET
 */

import crypto from "crypto";

const APP_ID = process.env.WECHAT_APP_ID || "";
const APP_SECRET = process.env.WECHAT_APP_SECRET || "";

let cachedTicket: { ticket: string; expiresAt: number } | null = null;

/** 获取 access_token */
async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`
  );
  const d = await res.json();
  if (d.errcode) throw new Error(`微信 access_token 错误: ${d.errmsg}`);
  return d.access_token;
}

/** 获取 jsapi_ticket */
async function getJsApiTicket(): Promise<string> {
  if (cachedTicket && cachedTicket.expiresAt > Date.now()) {
    return cachedTicket.ticket;
  }
  const token = await getAccessToken();
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
  );
  const d = await res.json();
  if (d.errcode !== 0) throw new Error(`微信 ticket 错误: ${d.errmsg}`);
  cachedTicket = {
    ticket: d.ticket,
    expiresAt: Date.now() + (d.expires_in - 300) * 1000,
  };
  return d.ticket;
}

/** 生成 JSAPI 签名 */
export async function generateSignature(url: string): Promise<{
  appId: string; timestamp: string; nonceStr: string; signature: string;
}> {
  const ticket = await getJsApiTicket();
  const nonceStr = Math.random().toString(36).substring(2, 17);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const raw = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  const signature = crypto.createHash("sha1").update(raw).digest("hex");

  return { appId: APP_ID, timestamp, nonceStr, signature };
}
