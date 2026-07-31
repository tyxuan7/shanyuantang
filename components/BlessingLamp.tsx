"use client";

interface BlessingLampProps {
  name?: string;
  blessing?: string;
  size?: "sm" | "md" | "lg";
}

const DEFAULT_PILGRIMS = [
  "善信·慧心",
  "善信·福缘",
  "善信·静安",
  "善信·明德",
  "善信·慈恩",
  "善信·天佑",
  "善信·圆通",
  "善信·如意",
];

const DEFAULT_BLESSINGS = [
  "愿家人平安健康，万事顺遂",
  "愿事业有成，财源广进",
  "愿学业进步，金榜题名",
  "愿婚姻美满，家庭和睦",
  "愿儿女健康成长",
  "愿父母福寿安康",
  "愿诸事顺遂，心想事成",
  "愿世界和平，众生安乐",
];

export default function BlessingLamp({
  name: nameProp,
  blessing: blessingProp,
  size = "md",
}: BlessingLampProps) {
  const idx = Math.floor(Math.random() * DEFAULT_PILGRIMS.length);
  const name = nameProp || DEFAULT_PILGRIMS[idx];
  const blessing = blessingProp || DEFAULT_BLESSINGS[idx];

  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 灯 */}
      <div className="relative">
        <div className={`absolute inset-0 ${sizeMap[size]} rounded-full bg-gold-glow animate-pulse-gold`} />
        <div
          className={`relative ${sizeMap[size]} rounded-full border border-gold/30 bg-xuan-surface/60 flex items-center justify-center animate-flicker`}
        >
          <svg viewBox="0 0 80 100" className={size === "sm" ? "w-7" : size === "md" ? "w-9" : "w-14"}>
            <ellipse cx="40" cy="88" rx="28" ry="6" fill="rgba(201,160,92,0.25)" />
            <path d="M30 88 C30 65 35 55 40 55 C45 55 50 65 50 88" fill="rgba(201,160,92,0.15)" stroke="rgba(201,160,92,0.35)" strokeWidth="1" />
            <ellipse cx="40" cy="28" rx="8" ry="14" fill="rgba(253,230,138,0.5)" />
            <ellipse cx="40" cy="24" rx="5" ry="10" fill="rgba(253,230,138,0.7)" />
            <ellipse cx="40" cy="20" rx="3" ry="6" fill="rgba(255,255,255,0.5)" />
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <ellipse
                key={i}
                cx={40 + 18 * Math.cos((angle * Math.PI) / 180)}
                cy={45 + 12 * Math.sin((angle * Math.PI) / 180)}
                rx="10" ry="3"
                fill="rgba(201,160,92,0.2)"
                transform={`rotate(${angle} ${40 + 18 * Math.cos((angle * Math.PI) / 180)} ${45 + 12 * Math.sin((angle * Math.PI) / 180)})`}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 信息 */}
      <p className="text-xs text-gold font-medium text-center">{name}</p>
      <p className="text-[11px] text-paper-muted text-center leading-snug max-w-[120px] line-clamp-2">
        {blessing}
      </p>
    </div>
  );
}
