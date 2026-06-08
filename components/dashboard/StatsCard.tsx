"use client";

import Image from "next/image";

type Props = {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  color?: "green" | "amber" | "blue";
  bgImage?: string;
};

const colorMap = {
  green: {
    bg: "from-emerald-500/10 to-emerald-900/5",
    border: "border-emerald-500/10 hover:border-emerald-500/20",
    icon: "bg-emerald-500/10 text-emerald-400",
    glow: "shadow-emerald-500/5",
    value: "text-emerald-50",
    trend: "text-emerald-400",
  },
  amber: {
    bg: "from-amber-500/10 to-amber-900/5",
    border: "border-amber-500/10 hover:border-amber-500/20",
    icon: "bg-amber-500/10 text-amber-400",
    glow: "shadow-amber-500/5",
    value: "text-amber-50",
    trend: "text-amber-400",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-900/5",
    border: "border-blue-500/10 hover:border-blue-500/20",
    icon: "bg-blue-500/10 text-blue-400",
    glow: "shadow-blue-500/5",
    value: "text-blue-50",
    trend: "text-blue-400",
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "green",
  bgImage,
}: Props) {
  const c = colorMap[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-500 hover:shadow-lg ${c.bg} ${c.border} ${c.glow}`}
    >
      {/* Background decorative image */}
      {bgImage && (
        <div className="absolute inset-0 pointer-events-none select-none">
          <Image
            src={bgImage}
            alt=""
            fill
            className="object-cover opacity-[0.1] mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#050B07]/60 to-[#050B07]/90" />
        </div>
      )}

      {/* Subtle hover shimmer */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${c.icon}`}
          >
            {icon}
          </div>

          {trend && (
            <span className={`text-xs font-semibold ${c.trend}`}>
              {trend}
            </span>
          )}
        </div>

        <p className={`mt-5 text-4xl font-extrabold tracking-tight ${c.value}`}>
          {value}
        </p>

        <p className="mt-1.5 text-sm font-medium text-zinc-500">
          {title}
        </p>
      </div>
    </div>
  );
}