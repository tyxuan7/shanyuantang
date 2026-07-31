"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { GuestInfo } from "@/lib/guest";

const NAV_LINKS = [
  { href: "/blessing", label: "为家人祈福" },
  { href: "/lottery", label: "求灵签" },
  { href: "/bazi", label: "八字精批" },
  { href: "/palmistry", label: "手相/面相" },
  { href: "/dream", label: "周公解梦" },
  { href: "/naming", label: "宝宝起名" },
  { href: "/meditation", label: "静心禅坐" },
  { href: "/almanac", label: "今日黄历" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [musicOn, setMusicOn] = useState(false);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return; // 后台页面不创建访客
    const stored = localStorage.getItem("putiyuan_guest");
    if (stored) {
      try { setGuest(JSON.parse(stored)); } catch {}
    } else {
      fetch("/api/guest/init")
        .then(r => r.json())
        .then((info: GuestInfo) => {
          localStorage.setItem("putiyuan_guest", JSON.stringify(info));
          setGuest(info);
        });
    }
  }, [isAdmin]);

  const toggleMusic = () => setMusicOn(!musicOn);

  if (isAdmin) return null;

  return (
    <header className="fixed top-0 z-50 w-full transition-all safe-top bg-xuan/95 backdrop-blur-md border-b border-gold/10">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
          <img src="/logo.svg" alt="善缘堂" className="size-9 rounded-full object-contain drop-shadow-[0_0_8px_rgba(201,160,94,0.4)]" />
          <span className="text-[1.3rem] md:text-[1.5rem] leading-none text-gradient-gold hidden sm:inline" style={{ fontFamily: "var(--font-calligraphy)" }}>
            善缘堂
          </span>
        </Link>

        {/* 桌面端导航 — flex 自适应，窄屏横向滚动 */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 flex-1 justify-center overflow-x-auto min-w-0">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-2.5 lg:px-3 py-2 rounded-lg text-[14px] lg:text-[15px] font-semibold tracking-wide transition-all duration-200 no-underline whitespace-nowrap shrink-0 ${
                pathname === link.href ? "text-gold bg-gold/10" : "text-paper-dark hover:text-gold hover:bg-gold/5"
              }`}>{link.label}</Link>
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 下载按钮 */}
          <button title="下载APP" onClick={() => alert("敬请期待")}
            className="hidden md:inline-flex size-9 items-center justify-center rounded-full border border-gold/25 text-paper-dark hover:border-gold/40 hover:text-gold transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>

          {/* 音乐按钮 */}
          <button title={musicOn ? "关闭音乐" : "播放音乐"} onClick={toggleMusic}
            className="hidden md:inline-flex size-9 items-center justify-center rounded-full border border-gold/25 text-paper-dark hover:border-gold/40 hover:text-gold transition-colors">
            {musicOn ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"/><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            )}
          </button>

          {/* 缘主入口 — 后台页面不显示 */}
          {!isAdmin && guest && (
            <Link href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 text-xs md:text-sm tracking-wide text-gold hover:bg-gold/10 transition-all no-underline">
              <span>☸</span>
              <span>{guest.name}</span>
            </Link>
          )}

          {/* 移动端菜单按钮 */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative inline-flex size-9 items-center justify-center rounded-full border border-gold-subtle text-paper-dark hover:text-gold md:hidden"
            aria-label="菜单">
            {mobileMenuOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="5" x2="13" y2="5"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="3" y1="11" x2="13" y2="11"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 inset-x-0 bg-xuan-card/98 backdrop-blur-md border-b border-gold-subtle shadow-lg z-50">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors no-underline ${
                  pathname === link.href ? "text-gold bg-gold/10" : "text-paper-dark hover:text-gold"
                }`}>{link.label}</Link>
            ))}
            <hr className="border-gold-subtle my-1" />
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gold no-underline">
              ☸ {guest?.name || "缘主"} · 个人中心
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
