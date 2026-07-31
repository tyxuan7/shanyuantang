interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-12 text-center">
      <div className="relative mx-auto flex size-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold shadow-gold">
        <span className="text-3xl">{icon}</span>
      </div>
      <h1
        className="text-4xl md:text-5xl tracking-widest text-gradient-gold"
        style={{ fontFamily: "var(--font-calligraphy)" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm md:text-base text-paper-muted max-w-md leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
