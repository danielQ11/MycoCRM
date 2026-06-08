"use client";

import { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

type Props = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
};

export default function PBITile({ title, icon, children, className = "", bodyClass = "" }: Props) {
  return (
    <div className={`pbi-tile ${className}`}>
      <div className="pbi-tile-header">
        <h3 className="flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <button className="text-zinc-600 hover:text-zinc-400 transition p-0.5 rounded">
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div className={`pbi-tile-body ${bodyClass}`}>
        {children}
      </div>
    </div>
  );
}
