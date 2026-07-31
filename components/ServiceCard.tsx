import Link from "next/link";

interface ServiceCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  tag?: string;
}

export default function ServiceCard({
  href, icon, title, description, tag,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-3 rounded-xl border border-gold-subtle bg-xuan-card/95 p-5 md:p-6 shadow-gold backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:shadow-gold hover:scale-[1.02] no-underline"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl">{icon}</span>
          <h3 className="text-base md:text-lg font-bold text-paper tracking-wide">{title}</h3>
        </div>
        {tag && (
          <span className="rounded-full border border-gold-subtle px-2.5 py-0.5 text-xs font-semibold text-gold/80">
            {tag}
          </span>
        )}
      </div>
      <p className="text-sm md:text-[15px] text-paper-muted leading-relaxed">{description}</p>
    </Link>
  );
}
