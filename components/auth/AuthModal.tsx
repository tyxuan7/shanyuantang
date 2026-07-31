"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onLogin: (user: { nickname: string; role: string }) => void;
}

export default function AuthModal({ onClose, onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!username || !password) { setError("请填写用户名和密码"); return; }
    setLoading(true);

    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.error) { setError(data.error); return; }

    localStorage.setItem("auth_token", data.token);
    onLogin(data.user);
    onClose();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-xuan border border-gold-subtle text-paper text-sm placeholder:text-paper-muted focus:outline-none focus:border-gold/50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl border border-gold/30 bg-xuan-card p-6 shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}>

        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold-glow flex items-center justify-center mb-3">
            <span className="text-2xl">☸</span>
          </div>
          <h2 className="text-xl text-gradient-gold" style={{ fontFamily: "var(--font-calligraphy)" }}>
            {mode === "login" ? "缘主归来" : "结缘善缘堂"}
          </h2>
          <p className="text-xs text-paper-muted mt-1">
            {mode === "login" ? "欢迎回来，愿佛光常照" : "注册即成为缘主，福生无量"}
          </p>
        </div>

        {/* 表单 */}
        <div className="space-y-3">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="用户名" className={inputClass}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="密码" className={inputClass}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {error && <p className="text-xs text-vermillion text-center">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-gold-dark to-gold text-white font-semibold text-sm hover:shadow-lg hover:shadow-gold/20 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? "处理中..." : mode === "login" ? "登 录" : "注 册"}
          </button>
        </div>

        {/* 切换 */}
        <div className="mt-4 text-center">
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-xs text-paper-muted hover:text-gold transition-colors">
            {mode === "login" ? "还没有账号？注册成为缘主 →" : "已有账号？立即登录 →"}
          </button>
        </div>

        {/* 游客提示 */}
        <p className="text-center text-[11px] text-paper-muted mt-4 opacity-60">
          未注册即为<span className="text-paper-muted">游客</span>，注册后成为<span className="text-gold">缘主</span>
        </p>
      </div>
    </div>
  );
}
