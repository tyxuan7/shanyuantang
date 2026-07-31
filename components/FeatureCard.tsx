import Link from "next/link";

interface FeatureCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export default function FeatureCard({
  href,
  icon,
  title,
  description,
  badge,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-card hover:bg-card-hover transition-all duration-300 no-underline hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* 徽章 */}
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-red)]/80 text-white">
          {badge}
        </span>
      )}

      {/* 图标 */}
      <div className="relative w-14 h-14 rounded-xl bg-gold-glow flex items-center justify-center group-hover:animate-pulse-gold transition-shadow">
        <span className="text-2xl">{icon}</span>
      </div>

      {/* 文字 */}
      <div className="text-center">
        <h3 className="text-base font-medium text-[var(--color-paper)] mb-1">
          {title}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
