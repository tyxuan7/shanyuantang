"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function formatField(key: string, val: any): string {
  if (!val) return "—";
  const s = String(val);
  // 日期格式转换: "2026-07-31 23:19:17" 或 "2026-07-31T23:19:17.000Z" → "2026年07月31日 23:19:17"
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);
  if (m) {
    return `${m[1]}年${m[2]}月${m[3]}日 ${m[4]}:${m[5]}:${m[6]}`;
  }
  return s;
}

const FIELD_LABELS: Record<string,string> = {
  pilgrim_name:"祈福者",blessing_type:"灯类型",blessing_text:"祈福内容",duration:"供奉时长",created_at:"时间",expires_at:"到期时间",
  lot_number:"签号",master:"师父",poem:"签文",interpretation:"解签",
  name:"姓名",gender:"性别",birth_date:"出生日期",birth_hour:"出生时辰",result_text:"结果",
  dream_text:"梦境", surname:"姓氏",style:"风格偏好",
  product_name:"产品",amount:"金额",status:"状态",paid_at:"支付时间",
};

interface GuestInfo { id:string; number:number; name:string; phone:string; userId:string; }

export default function ProfilePage() {
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [phone, setPhone] = useState(""); const [bindMsg, setBindMsg] = useState(""); const [bindLoading, setBindLoading] = useState(false);
  const [tab, setTab] = useState<"blessings"|"lottery"|"bazi"|"dream"|"naming"|"orders">("blessings");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => { const raw = localStorage.getItem("putiyuan_guest"); if (raw) { try { setGuest(JSON.parse(raw)); } catch {} } }, []);

  const dailyVerse = (()=>{ const v=["一切有为法，如梦幻泡影，如露亦如电，应作如是观。","菩提本无树，明镜亦非台，本来无一物，何处惹尘埃。","心如工画师，能画诸世间，五蕴悉从生，无法而不造。"]; return v[new Date().getDate()%v.length]; })();

  const handleBind = async () => {
    setBindMsg(""); if (!/^1[3-9]\d{9}$/.test(phone)) { setBindMsg("请输入正确的手机号"); return; }
    setBindLoading(true);
    const res = await fetch("/api/guest/bind",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({guestNumber:guest?.number,phone})});
    const d = await res.json(); setBindLoading(false);
    if (d.error) { setBindMsg(d.error); return; }
    const updated = { ...guest!, phone, userId: d.userId };
    localStorage.setItem("putiyuan_guest", JSON.stringify(updated)); setGuest(updated);
  };

  const fetchRecords = async (type: string) => {
    setLoading(true);
    try {
      const hdr:Record<string,string>={}; if (guest) { hdr["x-guest-id"]=guest.id; hdr["x-guest-number"]=String(guest.number); }
      const res = await fetch(`/api/guest/records?type=${type}`,{headers:hdr});
      const d = await res.json(); setRecords(d.items||[]);
    } catch { setRecords([]); }
    setLoading(false);
  };

  useEffect(() => { if (guest) fetchRecords(tab); }, [tab, guest]);
  const isBound = guest?.phone && guest.phone.length>0;

  return (
    <div className="animate-fade-in pb-20">
      <div className="rounded-2xl border border-gold/30 bg-xuan-card/95 p-6 shadow-gold mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gold-glow flex items-center justify-center text-3xl animate-pulse-gold shrink-0">☸</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl text-gold truncate" style={{fontFamily:"var(--font-calligraphy)"}}>{guest?.name||"缘主"}</h1>
            <p className="text-xs text-paper-muted mt-0.5">编号 #{guest?.number||"—"} · {isBound?"已认证":"未绑定手机"}</p>
            {isBound && <p className="text-xs text-paper-muted">{guest!.phone.slice(0,3)}****{guest!.phone.slice(-4)}</p>}
          </div>
          {!isBound && <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400 shrink-0">待绑定</span>}
        </div>
        <div className="bg-xuan rounded-xl p-3 text-center"><p className="text-xs text-paper-muted italic leading-relaxed">"{dailyVerse}"</p></div>
      </div>

      {!isBound && (
        <div className="rounded-2xl border border-gold-subtle bg-xuan-card/95 p-5 shadow-gold mb-6">
          <h3 className="text-sm text-gold mb-3">📱 绑定手机号</h3>
          <div className="flex gap-2">
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="输入手机号" maxLength={11}
              className="flex-1 px-4 py-2.5 rounded-lg bg-xuan border border-gold-subtle text-paper text-sm focus:outline-none focus:border-gold/50" />
            <button onClick={handleBind} disabled={bindLoading}
              className="px-5 py-2.5 rounded-lg bg-gold text-xuan font-semibold text-sm hover:bg-gold-light transition-all shrink-0">
              {bindLoading?"绑定中...":"绑定"}</button>
          </div>
          {bindMsg && <p className="text-xs text-vermillion mt-2">{bindMsg}</p>}
        </div>
      )}

      <div className="rounded-2xl border border-gold-subtle bg-xuan-card/95 shadow-gold overflow-hidden mb-6">
        <div className="flex overflow-x-auto border-b border-gold-subtle">
          {(["blessings","lottery","bazi","dream","naming","orders"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors whitespace-nowrap px-2 ${tab===t?"text-gold border-b-2 border-gold":"text-paper-muted hover:text-paper-dark"}`}>
              {{blessings:"🪔 祈福",lottery:"📜 求签",bazi:"📅 八字",dream:"🌙 解梦",naming:"📛 起名",orders:"📦 订单"}[t]}
            </button>
          ))}
        </div>
        <div className="p-4">
          {loading ? <p className="text-center text-paper-muted text-sm py-8">加载中...</p> :
           records.length===0 ? (
            <div className="text-center py-8"><p className="text-3xl mb-2">📭</p><p className="text-sm text-paper-muted">暂无记录</p></div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {records.map((r:any,i:number)=>(
                <button key={i} onClick={()=>setDetail(r)} className="w-full text-left bg-xuan rounded-lg p-3 text-xs hover:bg-gold/5 transition-colors">
                  {tab==="blessings" && <span>{r.pilgrim_name||"善信"} · {((r.blessing_type||"").split("|")[1])||r.blessing_type} · {r.blessing_text?.slice(0,25)}{r.blessing_text?.length>25?"...":""} <span className="text-paper-muted float-right">{r.created_at?.slice(0,10)}</span></span>}
                  {tab==="lottery" && <span>第{r.lot_number}签 · {r.master||""} · {r.interpretation?.slice(0,25)}... <span className="text-paper-muted float-right">{r.created_at?.slice(0,10)}</span></span>}
                  {tab==="bazi" && <span>{r.birth_date||""} · {r.result_text?.slice(0,25)}... <span className="text-paper-muted float-right">{r.created_at?.slice(0,10)}</span></span>}
                  {tab==="dream" && <span>{r.dream_text?.slice(0,20)||""} · {r.result_text?.slice(0,25)}... <span className="text-paper-muted float-right">{r.created_at?.slice(0,10)}</span></span>}
                  {tab==="naming" && <span>{r.surname||""}氏 · {r.result_text?.slice(0,25)}... <span className="text-paper-muted float-right">{r.created_at?.slice(0,10)}</span></span>}
                  {tab==="orders" && <span>{r.product_name||""} · ¥{(r.amount/100).toFixed(2)} <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.status==="paid"?"bg-green-500/20 text-green-400":"bg-yellow-500/20 text-yellow-400"}`}>{r.status||"pending"}</span> <span className="text-paper-muted float-right">{r.created_at?.slice(0,10)}</span></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={()=>setDetail(null)}>
          <div className="absolute inset-0 bg-black/70"/>
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-gold/30 bg-xuan-card p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gold text-lg" style={{fontFamily:"var(--font-calligraphy)"}}>详细信息</h3>
              <button onClick={()=>setDetail(null)} className="text-paper-muted hover:text-gold text-lg">✕</button>
            </div>
            <div className="space-y-2 text-sm text-paper-dark">
              {Object.entries(detail as Record<string,any>).filter(([k])=>!["id","user_id"].includes(k)).map(([k,v])=>(
                <div key={k} className="bg-xuan rounded-lg p-3">
                  <p className="text-xs text-paper-muted mb-1">{FIELD_LABELS[k]||k}</p>
                  <p className="whitespace-pre-wrap leading-relaxed">{k==="amount"?`¥${(+(v)/100).toFixed(2)}`:formatField(k, v)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
