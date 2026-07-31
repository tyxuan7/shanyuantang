export default function LoadingSpinner({
  text = "加载中...",
}: {
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-gold/15" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin-slow" />
      </div>
      <p className="text-sm text-paper-muted">{text}</p>
    </div>
  );
}
