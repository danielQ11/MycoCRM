"use client";

import { RefreshCw, Download, Maximize2, Minimize2, Filter, Clock } from "lucide-react";

type Props = {
  onRefresh: () => void;
  onExport: () => void;
  onToggleFilters: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  filtersOpen: boolean;
  cargando: boolean;
  lastUpdate: string | null;
};

export default function PBIRibbon({
  onRefresh, onExport, onToggleFilters, onToggleFullscreen,
  isFullscreen, filtersOpen, cargando, lastUpdate,
}: Props) {
  return (
    <div className="pbi-ribbon px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center text-sm">
            📊
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-purple-400/60">
              Power BI
            </span>
            <span className="text-[0.5rem] text-zinc-600 -mt-0.5">MycoCRM Analytics</span>
          </div>
        </div>
        <div className="h-6 w-px bg-white/[0.06] hidden sm:block" />
        <h1 className="text-sm font-bold text-purple-200/80 truncate">
          Reporte del Ecosistema
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {lastUpdate && (
          <span className="hidden lg:flex items-center gap-1.5 text-[0.65rem] text-zinc-600 mr-2">
            <Clock size={11} />
            {lastUpdate}
          </span>
        )}
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.7rem] font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition"
          title="Actualizar datos"
        >
          <RefreshCw size={13} className={cargando ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.7rem] font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition"
          title="Exportar CSV"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Exportar</span>
        </button>
        <div className="h-5 w-px bg-white/[0.06]" />
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.7rem] font-semibold transition ${
            filtersOpen
              ? "bg-purple-500/10 text-purple-400"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
          }`}
          title="Panel de filtros"
        >
          <Filter size={13} />
          <span className="hidden sm:inline">Filtros</span>
        </button>
        <button
          onClick={onToggleFullscreen}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  );
}
