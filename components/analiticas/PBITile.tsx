"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

type Props = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
  bgImage?: string;
};

export default function PBITile({ 
  title, 
  icon, 
  children, 
  className = "", 
  bodyClass = "",
  bgImage
}: Props) {
  return (
    <div className={`pbi-tile group relative overflow-hidden ${className}`}>
      {/* Background image in purple/violet tint */}
      {bgImage && (
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <Image
            src={bgImage}
            alt=""
            fill
            className="object-cover opacity-[0.05] mix-blend-screen transition-opacity duration-300 group-hover:opacity-[0.07]"
            style={{ filter: "hue-rotate(140deg) saturate(1.8) brightness(0.9)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08060F]/90 via-transparent to-[#0E0A17]/95" />
        </div>
      )}

      {/* Content wrapper to force stacking above bg */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="pbi-tile-header">
          <h3 className="flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <button className="text-zinc-600 hover:text-zinc-400 transition p-0.5 rounded">
            <MoreHorizontal size={14} />
          </button>
        </div>
        <div className={`pbi-tile-body flex-1 ${bodyClass}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
