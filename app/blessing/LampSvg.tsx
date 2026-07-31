"use client";

import { useId } from "react";

interface Props {
  lampType: "qingxin"|"zhihui"|"changshou"|"pingan"|"yinyuan"|"caifu";
  color: string;
  name: string;
  blessing: string;
  size?: "sm" | "lg";
}

export default function LampSvg({ lampType, color, name, blessing, size = "sm" }: Props) {
  const reactId = useId().replace(/:/g, "");
  const uid = `${lampType}-${reactId}`;
  const w = size === "lg" ? 200 : 130;
  const h = size === "lg" ? 280 : 180;

  return (
    <div className="mx-auto inline-flex flex-col items-center">
      <svg width={w} height={h} viewBox="0 0 240 320" className="overflow-visible">
        <defs>
          <radialGradient id={`body-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff5d8" stopOpacity="0.95"/>
            <stop offset="35%" stopColor={color} stopOpacity="1"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.85"/>
          </radialGradient>
          <radialGradient id={`glow-${uid}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
            <stop offset="60%" stopColor={color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`highlight-${uid}`} cx="35%" cy="30%" r="35%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a"/>
            <stop offset="50%" stopColor="#c9a05c"/>
            <stop offset="100%" stopColor="#7c4f1a"/>
          </linearGradient>
          <linearGradient id={`tassel-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626"/>
            <stop offset="100%" stopColor="#7f1d1d"/>
          </linearGradient>
          <radialGradient id={`flame-${uid}`} cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#fff7c0"/>
            <stop offset="40%" stopColor="#ffd97a"/>
            <stop offset="80%" stopColor="#ff8b3d" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#ff5a14" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* 挂绳 */}
        <line x1="120" y1="0" x2="120" y2="20" stroke={`url(#metal-${uid})`} strokeWidth="2"/>
        <ellipse cx="120" cy="20" rx="8" ry="4" fill={`url(#metal-${uid})`} stroke="#7c4f1a" strokeWidth="1"/>
        <rect x="108" y="22" width="24" height="6" rx="2" fill={`url(#metal-${uid})`} stroke="#7c4f1a" strokeWidth="0.5"/>
        <path d="M 60 38 Q 120 24 180 38 L 170 50 Q 120 42 70 50 Z" fill={`url(#metal-${uid})`} stroke="#7c4f1a" strokeWidth="1"/>
        <path d="M 70 50 Q 120 42 170 50 L 165 56 Q 120 50 75 56 Z" fill="#7c4f1a"/>

        {/* 灯身 */}
        <ellipse cx="120" cy="150" rx="68" ry="92" fill={`url(#body-${uid})`} stroke={color} strokeWidth="2"/>

        {/* 纹路 */}
        {[105,111,117,123,129,135].map((x,i) => (
          <path key={i} d={`M ${x} 60 Q ${55+i*26} 150 ${x} 240`} stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" fill="none"/>
        ))}
        {[80,110,150,190,220].map((y,i) => {
          const rx = 68 * Math.sqrt(1 - Math.pow((y-150)/92, 2));
          const lx = 120 - rx + 5;
          const rx2 = 120 + rx - 5;
          return <line key={i} x1={lx} y1={y} x2={rx2} y2={y} stroke="rgba(0,0,0,0.15)" strokeWidth="0.6"/>;
        })}

        {/* 高光 */}
        <ellipse cx="102" cy="120" rx="28" ry="36" fill={`url(#highlight-${uid})`}/>

        {/* 底部金属 */}
        <path d="M 70 240 Q 120 252 170 240 L 165 248 Q 120 256 75 248 Z" fill={`url(#metal-${uid})`} stroke="#7c4f1a" strokeWidth="1"/>

        {/* 流苏 */}
        <g style={{animation: "tassel-sway 3s ease-in-out infinite", transformOrigin: "120px 252px"}}>
          {[-15,-5,5,15].map((dx,i) => (
            <g key={i}>
              <line x1={120+dx} y1="252" x2={120+dx*1.4} y2={i===1||i===2?286:282} stroke={`url(#tassel-${uid})`} strokeWidth="2"/>
              <circle cx={120+dx*1.4} cy={i===1||i===2?289:285} r="2.5" fill="#dc2626"/>
            </g>
          ))}
          <line x1="120" y1="252" x2="120" y2="296" stroke={`url(#tassel-${uid})`} strokeWidth="2.5"/>
          <circle cx="120" cy="300" r="4" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.5"/>
        </g>

        {/* 灯上文字 */}
        <g textAnchor="middle" fontFamily="STKaiti, KaiTi, 楷体, serif" fontWeight="bold" fill="#3a1f0a" style={{filter:"drop-shadow(0 0 4px rgba(255,220,140,0.95))"}}>
          <text x="120" y="138" fontSize="20">{name?.slice(0,1) || "善"}</text>
          <text x="120" y="159" fontSize="20">*</text>
        </g>
      </svg>
    </div>
  );
}
