"use client";

import { useState, useEffect, useCallback } from "react";

/* ============ 类型 ============ */
interface Stats { users: number; blessings: number; lottery_draws: number; palm_readings: number; face_readings: number; naming_requests: number; dream_analyses: number; bazi_readings: number; orders_total: number; orders_paid: number; revenue_yuan: string; }
interface User { id: string; username: string; nickname: string; role: string; balance: number; created_at: string; }
interface BlessingItem { id: string; user_id: string | null; pilgrim_name: string; blessing_type: string; blessing_text: string; created_at: string; }
interface LotteryItem { id: string; user_id: string | null; lot_number: number; poem: string; interpretation: string; created_at: string; }
interface OrderItem { id: string; user_id: string | null; product_name: string; amount: number; status: string; payee_name: string; created_at: string; }
interface PalmItem { id: string; user_id: string | null; result_text: string; created_at: string; }
interface FaceItem { id: string; user_id: string | null; result_text: string; created_at: string; }
interface NamingItem { id: string; user_id: string | null; surname: string; gender: string; birth_date: string; style: string; result_text: string; created_at: string; }
interface DreamItem { id: string; user_id: string | null; dream_text: string; result_text: string; created_at: string; }
interface BaziItem { id: string; user_id: string | null; name: string; gender: string; birth_date: string; birth_hour: string; result_text: string; created_at: string; }

type TabKey = "dashboard" | "users" | "blessings" | "lottery" | "orders" | "palm" | "face" | "naming" | "dream" | "bazi";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "概览", icon: "📊" },
  { key: "users", label: "用户", icon: "👥" },
  { key: "blessings", label: "祈福", icon: "🪔" },
  { key: "lottery", label: "求签", icon: "📜" },
  { key: "orders", label: "订单", icon: "📦" },
  { key: "bazi", label: "八字", icon: "📅" },
  { key: "dream", label: "解梦", icon: "🌙" },
  { key: "palm", label: "手相", icon: "✋" },
  { key: "face", label: "面相", icon: "😊" },
  { key: "naming", label: "起名", icon: "📛" },
];

const BLESSING_MAP: Record<string, string> = {
  health: "健康平安", career: "事业顺利", wealth: "财源广进",
  study: "学业有成", love: "姻缘美满", family: "家庭和睦",
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  // 各表数据
  const [users, setUsers] = useState<User[]>([]);
  const [blessings, setBlessings] = useState<BlessingItem[]>([]);
  const [lottery, setLottery] = useState<LotteryItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [palm, setPalm] = useState<PalmItem[]>([]);
  const [face, setFace] = useState<FaceItem[]>([]);
  const [naming, setNaming] = useState<NamingItem[]>([]);
  const [dream, setDream] = useState<DreamItem[]>([]);
  const [bazi, setBazi] = useState<BaziItem[]>([]);

  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<{ id: string; nickname: string; role: string; balance: number } | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api = useCallback(async (url: string, opts?: RequestInit): Promise<any> => {
    const res = await fetch(url, { ...opts, headers: { ...headers, ...opts?.headers } });
    return res.json();
  }, [token]);

  // 登录检查
  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) { setToken(saved); setIsAuthed(true); }
  }, []);

  // 数据加载
  useEffect(() => {
    if (!isAuthed) return;
    setLoading(true);
    Promise.all([
      api("/api/admin/stats").then((d: any) => { if (d?.stats) setStats(d.stats); }),
      api("/api/admin/users").then((d: any) => { if (d?.users) setUsers(d.users); }),
      api("/api/admin/blessings").then((d: any) => { if (d?.items) setBlessings(d.items); }),
      api("/api/admin/lottery").then((d: any) => { if (d?.items) setLottery(d.items); }),
      api("/api/admin/orders").then((d: any) => { if (d?.orders) setOrders(d.orders); }),
      api("/api/admin/palm").then((d: any) => { if (d?.items) setPalm(d.items); }),
      api("/api/admin/face").then((d: any) => { if (d?.items) setFace(d.items); }),
      api("/api/admin/naming").then((d: any) => { if (d?.items) setNaming(d.items); }),
      api("/api/admin/dream").then((d: any) => { if (d?.items) setDream(d.items); }),
      api("/api/admin/bazi").then((d: any) => { if (d?.items) setBazi(d.items); }),
    ]).finally(() => setLoading(false));
  }, [isAuthed, api]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!loginUser || !loginPass) { alert("请填写用户名和密码"); setLoading(false); return; }
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: loginUser, password: loginPass }) });
      const d = await res.json();
      if (d.token) { localStorage.setItem("admin_token", d.token); setToken(d.token); setIsAuthed(true); }
      else alert(d.error || "登录失败");
    } catch { alert("网络错误"); }
    setLoading(false);
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    await api("/api/admin/users", { method: "PATCH", body: JSON.stringify({ user_id: editUser.id, nickname: editUser.nickname, role: editUser.role, balance: editUser.balance }) });
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editUser } : u));
    setEditUser(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("确定删除该用户？")) return;
    await api("/api/admin/users", { method: "DELETE", body: JSON.stringify({ user_id: id }) });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleOrderStatus = async (id: string, status: string) => {
    await api("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ order_id: id, status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filteredUsers = (users || []).filter(u => !search || u.username.includes(search) || u.nickname.includes(search));
  const filteredOrders = (orders || []).filter(o => !filterStatus || o.status === filterStatus);

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // ==================== 登录页 ====================
  if (!isAuthed) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-xl border border-gold-subtle bg-xuan-card/95 p-6 shadow-gold">
          <h1 className="text-xl text-gold text-center mb-6">🔐 善缘堂 · 后台管理</h1>
          <div className="space-y-3">
            <input value={loginUser} onChange={e=>setLoginUser(e.target.value)} type="text" placeholder="管理员账号" className="w-full px-4 py-2.5 rounded-lg bg-xuan border border-gold-subtle text-paper text-sm placeholder:text-paper-muted focus:outline-none focus:border-gold/50" />
            <input value={loginPass} onChange={e=>setLoginPass(e.target.value)} type="password" placeholder="密码" className="w-full px-4 py-2.5 rounded-lg bg-xuan border border-gold-subtle text-paper text-sm placeholder:text-paper-muted focus:outline-none focus:border-gold/50" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <button onClick={handleLogin} className="w-full py-3 rounded-lg bg-gold text-xuan font-medium text-sm hover:bg-gold-light transition-colors">登录</button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 主界面 ====================
  return (
    <div className="space-y-4 pb-8">
      {/* 顶栏 */}
      <div className="flex items-center justify-between sticky top-14 z-40 bg-xuan/90 backdrop-blur-sm py-3 -mx-4 px-4">
        <h1 className="text-xl text-gold" style={{ fontFamily: "var(--font-calligraphy)" }}>善缘堂 · 后台管理</h1>
        <button onClick={() => { localStorage.removeItem("admin_token"); setIsAuthed(false); }} className="text-xs text-paper-muted hover:text-vermillion">退出</button>
      </div>

      {/* Tab 导航 */}
      <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.key ? "bg-gold/15 text-gold border border-gold/30" : "text-paper-muted hover:text-paper-dark border border-transparent"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-paper-muted text-sm py-8">加载中...</p>}

      {/* ========== 1. 概览 ========== */}
      {!loading && tab === "dashboard" && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[
              { l: "用户", v: stats.users, i: "👥" }, { l: "祈福灯", v: stats.blessings, i: "🪔" },
              { l: "求签", v: stats.lottery_draws, i: "📜" }, { l: "八字", v: stats.bazi_readings, i: "📅" },
              { l: "解梦", v: stats.dream_analyses, i: "🌙" }, { l: "手相", v: stats.palm_readings, i: "✋" },
              { l: "面相", v: stats.face_readings, i: "😊" }, { l: "起名", v: stats.naming_requests, i: "📛" },
              { l: "总订单", v: stats.orders_total, i: "📦" }, { l: "营收", v: `¥${stats.revenue_yuan}`, i: "💰" },
            ].map(s => (
              <div key={s.l} className="rounded-xl border border-gold-subtle bg-xuan-card/95 p-3 text-center shadow-gold">
                <div className="text-xl">{s.i}</div>
                <div className="text-lg font-bold text-gold">{s.v}</div>
                <div className="text-[11px] text-paper-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== 2. 用户管理 ========== */}
      {!loading && tab === "users" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索用户名..." className="flex-1 px-3 py-2 rounded-lg bg-xuan border border-gold-subtle text-paper text-sm placeholder:text-paper-muted focus:outline-none" />
          </div>
          {editUser && (
            <div className="rounded-xl border border-gold/40 bg-xuan-card/95 p-4 space-y-2">
              <p className="text-sm text-gold">编辑用户: {editUser.id.slice(0,8)}...</p>
              <div className="flex gap-2">
                <input value={editUser.nickname} onChange={e => setEditUser({...editUser, nickname: e.target.value})} placeholder="昵称" className="flex-1 px-3 py-1.5 rounded bg-xuan border border-gold-subtle text-paper text-sm" />
                <select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} className="px-3 py-1.5 rounded bg-xuan border border-gold-subtle text-paper text-sm">
                  <option value="user">user</option><option value="admin">admin</option>
                </select>
                <input type="number" value={editUser.balance} onChange={e => setEditUser({...editUser, balance: +e.target.value})} placeholder="余额" className="w-20 px-3 py-1.5 rounded bg-xuan border border-gold-subtle text-paper text-sm" />
                <button onClick={handleEditUser} className="px-4 py-1.5 rounded bg-gold text-xuan text-sm font-medium">保存</button>
                <button onClick={() => setEditUser(null)} className="px-4 py-1.5 rounded border border-gold-subtle text-paper-muted text-sm">取消</button>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 overflow-hidden shadow-gold">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gold-subtle text-paper-dark text-xs">
                <th className="text-left p-2">用户名</th><th className="text-left p-2">昵称</th><th className="text-center p-2">角色</th><th className="text-right p-2">余额</th><th className="text-left p-2">注册时间</th><th className="text-center p-2">操作</th>
              </tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-gold-subtle/30 text-paper-dark">
                    <td className="p-2 font-mono text-xs">{u.username}</td>
                    <td className="p-2">{u.nickname}</td>
                    <td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${u.role==="admin"?"bg-vermillion/20 text-vermillion":"bg-gold/10 text-gold"}`}>{u.role}</span></td>
                    <td className="p-2 text-right">¥{(u.balance/100).toFixed(2)}</td>
                    <td className="p-2 text-xs">{u.created_at?.slice(0,10)}</td>
                    <td className="p-2 text-center">
                      <button onClick={() => setEditUser({ id: u.id, nickname: u.nickname, role: u.role, balance: u.balance })} className="px-2 py-1 rounded text-xs text-gold hover:bg-gold/10 mr-1">编辑</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="px-2 py-1 rounded text-xs text-vermillion hover:bg-vermillion/10">删除</button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-paper-muted">暂无数据</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== 3-10. 数据表格 ========== */}
      {!loading && tab === "blessings" && <DataTable title="祈福记录" columns={["祈福者","类型","祈福内容","时间"]} rows={blessings.map(b => [b.pilgrim_name, BLESSING_MAP[b.blessing_type]||b.blessing_type, b.blessing_text.slice(0,40), b.created_at?.slice(0,16)])} />}
      {!loading && tab === "lottery" && <DataTable title="求签记录" columns={["签号","签文","解签","时间"]} rows={lottery.map(l => [`第${l.lot_number}签`, l.poem.slice(0,30)+"...", l.interpretation.slice(0,40)+"...", l.created_at?.slice(0,16)])} />}
      {!loading && tab === "orders" && (
        <div className="space-y-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 rounded-lg bg-xuan border border-gold-subtle text-paper-dark text-xs">
            <option value="">全部</option><option value="pending">待支付</option><option value="paid">已支付</option><option value="completed">已完成</option>
          </select>
          <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 overflow-hidden shadow-gold">
            <table className="w-full text-sm"><thead><tr className="border-b border-gold-subtle text-paper-dark text-xs">
              <th className="text-left p-2">产品</th><th className="text-right p-2">金额</th><th className="text-center p-2">状态</th><th className="text-left p-2">时间</th><th className="text-center p-2">操作</th>
            </tr></thead><tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} className="border-b border-gold-subtle/30 text-paper-dark">
                  <td className="p-2">{o.product_name}</td><td className="p-2 text-right text-gold">¥{(o.amount/100).toFixed(2)}</td>
                  <td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${o.status==="paid"?"bg-green-500/20 text-green-400":o.status==="completed"?"bg-blue-500/20 text-blue-400":"bg-yellow-500/20 text-yellow-400"}`}>{{pending:"待支付",paid:"已支付",completed:"已完成",cancelled:"已取消"}[o.status]||o.status}</span></td>
                  <td className="p-2 text-xs">{o.created_at?.slice(0,16)}</td>
                  <td className="p-2 text-center">
                    {o.status==="pending" && <button onClick={() => handleOrderStatus(o.id,"paid")} className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">确认付款</button>}
                    {o.status==="paid" && <button onClick={() => handleOrderStatus(o.id,"completed")} className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">完成</button>}
                  </td>
                </tr>
              ))}
              {filteredOrders.length===0 && <tr><td colSpan={5} className="p-6 text-center text-paper-muted">暂无数据</td></tr>}
            </tbody></table>
          </div>
        </div>
      )}
      {!loading && tab === "bazi" && <DataTable title="八字精批记录" columns={["姓名","性别","出生日期","时辰","结果","时间"]} rows={bazi.map(b => [b.name, b.gender==="male"?"男":"女", b.birth_date, b.birth_hour+"时", b.result_text.slice(0,50)+"...", b.created_at?.slice(0,16)])} />}
      {!loading && tab === "dream" && <DataTable title="解梦记录" columns={["梦境","结果","时间"]} rows={dream.map(d => [d.dream_text.slice(0,30), d.result_text.slice(0,50)+"...", d.created_at?.slice(0,16)])} />}
      {!loading && tab === "palm" && <DataTable title="手相记录" columns={["结果摘要","时间"]} rows={palm.map(p => [p.result_text.slice(0,80)+"...", p.created_at?.slice(0,16)])} />}
      {!loading && tab === "face" && <DataTable title="面相记录" columns={["结果摘要","时间"]} rows={face.map(f => [f.result_text.slice(0,80)+"...", f.created_at?.slice(0,16)])} />}
      {!loading && tab === "naming" && <DataTable title="起名记录" columns={["姓氏","性别","出生日期","风格","结果","时间"]} rows={naming.map(n => [n.surname, n.gender==="male"?"男":"女", n.birth_date, n.style, n.result_text.slice(0,50)+"...", n.created_at?.slice(0,16)])} />}
    </div>
  );
}

/* 通用数据表格组件 */
function DataTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm text-paper-dark">{title} ({rows.length})</h2>
      <div className="rounded-xl border border-gold-subtle bg-xuan-card/95 overflow-hidden shadow-gold">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gold-subtle text-paper-dark text-xs">
              {columns.map((c, i) => <th key={i} className={`p-2 ${i===0?"text-left":"text-left"}`}>{c}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gold-subtle/30 text-paper-dark">
                  {row.map((cell, j) => <td key={j} className="p-2 text-xs">{cell}</td>)}
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={columns.length} className="p-6 text-center text-paper-muted">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
