"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/bazi", label: "八字", icon: "📅" },
  { href: "/lottery", label: "求签", icon: "📜" },
  { href: "/meditation", label: "禅坐", icon: "🧘" },
  { href: "/payment", label: "功德", icon: "💰" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-gold-subtle bg-xuan/95 backdrop-blur-md md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 no-underline min-w-[52px] ${
                isActive
                  ? "text-gold"
                  : "text-paper-muted hover:text-paper-dark"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[11px] tracking-wide">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-gradient-to-r from-gold to-gold-light" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
