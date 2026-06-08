"use client";

import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type Props = {
  ciudades: string[];
  filtroEstado: string;
  filtroCiudad: string;
  onEstadoChange: (v: string) => void;
  onCiudadChange: (v: string) => void;
  onClose: () => void;
  onReset: () => void;
};

export default function PBIFilterPanel({
  ciudades, filtroEstado, filtroCiudad,
  onEstadoChange, onCiudadChange, onClose, onReset,
}: Props) {
  const [seccionEstado, setSeccionEstado] = useState(true);
  const [seccionCiudad, setSeccionCiudad] = useState(true);

  const estados = ["Todos", "Activo", "Inactivo"];

  return (
    <div className="pbi-filter-panel w-64 shrink-0 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
        <span className="text-xs font-bold text-purple-200/70 uppercase tracking-wider">Filtros</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="text-[0.65rem] text-zinc-500 hover:text-purple-400 px-2 py-0.5 rounded transition"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition md:hidden"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Estado Slicer */}
      <div className="pbi-filter-section">
        <button
          onClick={() => setSeccionEstado(!seccionEstado)}
          className="flex items-center gap-1.5 w-full mb-2"
        >
          {seccionEstado ? <ChevronDown size={12} className="text-zinc-500" /> : <ChevronRight size={12} className="text-zinc-500" />}
          <label className="!mb-0 cursor-pointer">Estado del Cliente</label>
        </button>
        {seccionEstado && (
          <div className="space-y-1">
            {estados.map((est) => (
              <button
                key={est}
                onClick={() => onEstadoChange(est === "Todos" ? "" : est)}
                className={`pbi-slicer-btn ${
                  (est === "Todos" && !filtroEstado) || filtroEstado === est ? "active" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    est === "Activo" ? "bg-purple-500" : est === "Inactivo" ? "bg-purple-300" : "bg-zinc-600"
                  }`} />
                  {est}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ciudad Slicer */}
      <div className="pbi-filter-section">
        <button
          onClick={() => setSeccionCiudad(!seccionCiudad)}
          className="flex items-center gap-1.5 w-full mb-2"
        >
          {seccionCiudad ? <ChevronDown size={12} className="text-zinc-500" /> : <ChevronRight size={12} className="text-zinc-500" />}
          <label className="!mb-0 cursor-pointer">Municipio</label>
        </button>
        {seccionCiudad && (
          <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
            <button
              onClick={() => onCiudadChange("")}
              className={`pbi-slicer-btn ${!filtroCiudad ? "active" : ""}`}
            >
              Todos
            </button>
            {ciudades.map((c) => (
              <button
                key={c}
                onClick={() => onCiudadChange(c)}
                className={`pbi-slicer-btn ${filtroCiudad === c ? "active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Badge */}
      {(filtroEstado || filtroCiudad) && (
        <div className="px-4 py-3 mt-auto border-t border-white/[0.04]">
          <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 p-3">
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-purple-400/60 mb-1.5">
              Filtros activos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {filtroEstado && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-[0.65rem] font-semibold text-purple-300">
                  {filtroEstado}
                  <button onClick={() => onEstadoChange("")} className="hover:text-white">×</button>
                </span>
              )}
              {filtroCiudad && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-[0.65rem] font-semibold text-purple-300">
                  {filtroCiudad}
                  <button onClick={() => onCiudadChange("")} className="hover:text-white">×</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
