"use client";

import Image from "next/image";
import { X, ChevronDown, ChevronRight, Sparkles, Leaf, Activity, Zap } from "lucide-react";
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

  const tips = [
    "Filtra por ciudad para ver tendencias locales.",
    "Los clientes activos reflejan tu red más fuerte.",
    "Combina filtros para análisis más precisos.",
    "Exporta los datos filtrados con el botón CSV.",
    "Usa el radar para ver distribución territorial.",
    "La tasa de actividad muestra la salud del ecosistema.",
    "Cada municipio es un nodo de tu red micelial.",
  ];
  const tipDelDia = tips[new Date().getDay() % tips.length];

  return (
    <div className="pbi-filter-panel w-64 shrink-0 flex flex-col overflow-hidden">
      {/* ─── Background Image ─── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <Image
          src="/sidebar_bg.png"
          alt=""
          fill
          className="object-cover opacity-[0.05] mix-blend-screen"
          style={{ filter: "hue-rotate(140deg) saturate(1.8) brightness(0.9)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A14] via-transparent to-[#06040A]" />
      </div>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-10 top-16 h-32 w-32 rounded-full bg-purple-500/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-32 h-28 w-28 rounded-full bg-violet-500/[0.03] blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
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
      <div className="relative z-10 pbi-filter-section">
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
      <div className="relative z-10 pbi-filter-section">
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
        <div className="relative z-10 px-4 py-3 border-b border-white/[0.04]">
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

      {/* ─── Quick Insight Mini Cards ─── */}
      <div className="relative z-10 px-4 py-3">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-zinc-600 mb-2 px-1">
          Panel rápido
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 text-center group hover:border-purple-500/15 transition-all duration-300">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-1.5">
              <Activity size={12} />
            </div>
            <p className="text-[0.55rem] text-zinc-500 font-semibold uppercase">Estado</p>
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 text-center group hover:border-violet-500/15 transition-all duration-300">
            <div className="w-6 h-6 rounded-md bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-1.5">
              <Zap size={12} />
            </div>
            <p className="text-[0.55rem] text-zinc-500 font-semibold uppercase">Insights</p>
          </div>
        </div>
      </div>

      {/* ─── Tip del día ─── */}
      <div className="relative z-10 px-4 mt-1">
        <div className="rounded-xl border border-purple-500/[0.08] bg-gradient-to-br from-purple-900/10 to-transparent p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={11} className="text-purple-400/70" />
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-purple-400/60">
              Tip de análisis
            </p>
          </div>
          <p className="text-[0.65rem] text-zinc-500 leading-relaxed">
            {tipDelDia}
          </p>
        </div>
      </div>

      {/* ─── Spacer ─── */}
      <div className="flex-1" />

      {/* ─── Decorative forest image strip ─── */}
      <div className="relative z-10 mx-4 mb-3 overflow-hidden rounded-xl border border-white/[0.04]">
        <div className="relative h-24">
          <Image
            src="/card_bg_forest.png"
            alt="Bosque de micelio"
            fill
            className="object-cover opacity-40 mix-blend-screen"
            style={{ filter: "hue-rotate(140deg) saturate(1.8) brightness(0.9)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0A14] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div className="flex items-center gap-1.5">
              <Leaf size={10} className="text-violet-500/70" />
              <p className="text-[0.55rem] font-bold text-violet-400/70 uppercase tracking-wider">
                Red Analítica
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom info ─── */}
      <div className="relative z-10 border-t border-white/[0.04] px-4 py-3">
        <div className="rounded-xl bg-gradient-to-br from-purple-900/20 to-violet-900/10 px-3 py-2.5">
          <p className="text-[0.65rem] font-semibold text-purple-400/80">
            🔬 Motor de análisis
          </p>
          <p className="mt-0.5 text-[0.6rem] text-zinc-500">
            Datos en tiempo real
          </p>
        </div>
        <p className="mt-2 text-center text-[0.5rem] text-zinc-700 font-medium">
          MycoCRM Analytics v1.0
        </p>
      </div>
    </div>
  );
}
