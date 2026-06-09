"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import PBIRibbon from "@/components/analiticas/PBIRibbon";
import PBIFilterPanel from "@/components/analiticas/PBIFilterPanel";
import PBITile from "@/components/analiticas/PBITile";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Users, CheckCircle, XCircle, MapPin, TrendingUp,
  Calendar, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

type Cliente = {
  _id: string;
  nombre: string;
  telefono: string;
  correo: string;
  ciudad: string;
  estado: string;
  fechaRegistro: string;
};

type SortKey = "nombre" | "ciudad" | "estado" | "fechaRegistro";

const COLORS_BAR = ["#8B5CF6", "#A78BFA", "#C084FC", "#D8B4FE", "#9F7AEA", "#7C3AED", "#6366F1", "#805AD5"];
const ROWS_PER_PAGE = 8;

const normalizeCiudad = (ciudad: string): string => {
  if (!ciudad) return "Sin ciudad";
  const clean = ciudad.trim();
  const lower = clean.toLowerCase();
  
  if (lower === "medellin" || lower === "medellín") return "Medellín";
  if (lower === "itagui" || lower === "itagüí") return "Itagüí";
  if (lower === "bello") return "Bello";
  if (lower === "envigado") return "Envigado";
  if (lower === "sabaneta") return "Sabaneta";
  if (lower === "rionegro") return "Rionegro";
  if (lower === "copacabana") return "Copacabana";
  if (lower === "la estrella") return "La Estrella";
  if (lower === "girardota") return "Girardota";
  if (lower === "caldas") return "Caldas";
  
  return clean.split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function Analiticas() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // UI State
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pieTooltipPos, setPieTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handlePieMouseMove = (state: any) => {
    if (state && state.chartX !== undefined && state.chartY !== undefined) {
      // Offset by 15px to the right and 15px up from the cursor to avoid overlapping the cursor itself
      setPieTooltipPos({ x: state.chartX + 15, y: state.chartY - 15 });
    }
  };

  const handlePieMouseLeave = () => {
    setPieTooltipPos(null);
  };

  // Filters
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");

  // Table
  const [sortKey, setSortKey] = useState<SortKey>("fechaRegistro");
  const [sortAsc, setSortAsc] = useState(false);
  const [tablePage, setTablePage] = useState(0);

  const cargarClientes = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/clientes");
      if (!res.ok) throw new Error("Error");
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((c: Cliente) => ({
          ...c,
          ciudad: normalizeCiudad(c.ciudad)
        }));
        setClientes(normalized);
        setLastUpdate(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch { /* silent */ } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    cargarClientes();

    // Cambiar barras de scroll globales a morado
    document.body.classList.add("pbi-body");
    document.documentElement.classList.add("pbi-body");
    return () => {
      document.body.classList.remove("pbi-body");
      document.documentElement.classList.remove("pbi-body");
    };
  }, [cargarClientes]);

  // Filtered data
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      if (filtroEstado && c.estado !== filtroEstado) return false;
      if (filtroCiudad && c.ciudad !== filtroCiudad) return false;
      return true;
    });
  }, [clientes, filtroEstado, filtroCiudad]);

  // All unique cities for filter
  const ciudadesUnicas = useMemo(() => {
    const s = new Set(clientes.map((c) => c.ciudad || "Sin ciudad"));
    return Array.from(s).sort();
  }, [clientes]);

  // KPIs
  const total = clientesFiltrados.length;
  const activos = clientesFiltrados.filter((c) => c.estado === "Activo").length;
  const inactivos = total - activos;
  const pctActivos = total > 0 ? Math.round((activos / total) * 100) : 0;
  const territorios = new Set(clientesFiltrados.map((c) => c.ciudad).filter(Boolean)).size;

  // Chart data
  const ciudadesData = useMemo(() => {
    const counts: Record<string, number> = {};
    clientesFiltrados.forEach((c) => {
      const ciudad = c.ciudad || "N/A";
      counts[ciudad] = (counts[ciudad] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [clientesFiltrados]);



  const crecimientoData = useMemo(() => {
    const grupos: Record<string, number> = {};
    const sorted = [...clientesFiltrados].sort(
      (a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime()
    );
    sorted.forEach((c) => {
      const f = new Date(c.fechaRegistro);
      const mes = f.toLocaleString("es-CO", { month: "short", year: "numeric" });
      grupos[mes] = (grupos[mes] || 0) + 1;
    });
    let acum = 0;
    const datos: { fecha: string; acumulado: number; nuevos: number }[] = [];
    Object.keys(grupos).forEach((mes) => {
      acum += grupos[mes];
      datos.push({ fecha: mes, nuevos: grupos[mes], acumulado: acum });
    });
    return datos.length > 0 ? datos : [{ fecha: "Sin datos", nuevos: 0, acumulado: 0 }];
  }, [clientesFiltrados]);

  const dataEstados = [
    { name: "Activos", value: activos, color: "#8B5CF6" },
    { name: "Inactivos", value: inactivos, color: "#D8B4FE" },
  ];

  // Table sorting & pagination
  const tableSorted = useMemo(() => {
    const arr = [...clientesFiltrados].sort((a, b) => {
      const va = a[sortKey] || "";
      const vb = b[sortKey] || "";
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return arr;
  }, [clientesFiltrados, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(tableSorted.length / ROWS_PER_PAGE));
  const tableRows = tableSorted.slice(tablePage * ROWS_PER_PAGE, (tablePage + 1) * ROWS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setTablePage(0);
  };

  const exportarCSV = () => {
    const headers = ["Nombre", "Teléfono", "Correo", "Ciudad", "Estado", "Fecha"];
    const rows = clientesFiltrados.map((c) => [
      c.nombre, c.telefono || "", c.correo || "", c.ciudad || "", c.estado,
      c.fechaRegistro,
    ]);
    const csv = "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `reporte_mycocrm_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => { setFiltroEstado(""); setFiltroCiudad(""); setTablePage(0); };

  // Tooltip components
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-purple-500/20 bg-[#0A060F]/95 p-3 shadow-2xl backdrop-blur-md min-w-[140px] pointer-events-none">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-wider text-purple-200/70 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any) => (
            <div key={p.name} className="flex justify-between items-center gap-4">
              <span className="text-[0.7rem] text-zinc-400">{p.name === "acumulado" ? "Total Acumulado:" : "Nuevos registros:"}</span>
              <span className="text-xs font-black" style={{ color: p.color || p.fill }}>
                {p.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
    return (
      <div className="rounded-xl border border-purple-500/20 bg-[#0A060F]/95 p-3 shadow-2xl backdrop-blur-md min-w-[140px] pointer-events-none">
        <p className="text-xs font-black text-white mb-1">{d.name}</p>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[0.7rem] text-zinc-400">Clientes:</span>
          <span className="text-xs font-black text-purple-400">{d.value} ({pct}%)</span>
        </div>
      </div>
    );
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-xl border border-purple-500/20 bg-[#0A060F]/95 p-3 shadow-2xl backdrop-blur-md min-w-[140px] pointer-events-none">
        <p className="text-xs font-black" style={{ color: d.color }}>{d.name}</p>
        <div className="flex justify-between items-center gap-4 mt-1">
          <span className="text-[0.7rem] text-zinc-400">Cantidad:</span>
          <span className="text-xs font-black text-white">{d.value}</span>
        </div>
        <div className="flex justify-between items-center gap-4 mt-0.5">
          <span className="text-[0.7rem] text-zinc-400">Porcentaje:</span>
          <span className="text-xs font-black text-white">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
        </div>
      </div>
    );
  };

  const RadarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const val = d.value ?? 0;
    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
    return (
      <div className="rounded-xl border border-purple-500/35 bg-[#0A060F]/95 p-3 shadow-2xl backdrop-blur-md min-w-[150px] pointer-events-none">
        <p className="text-xs font-black text-purple-200/90 mb-1">📍 {d.name}</p>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[0.7rem] text-zinc-400">Clientes:</span>
          <span className="text-xs font-black text-white">{val}</span>
        </div>
        <div className="flex justify-between items-center gap-4 mt-0.5">
          <span className="text-[0.7rem] text-zinc-400">Proporción:</span>
          <span className="text-xs font-black text-purple-400">{pct}%</span>
        </div>
      </div>
    );
  };

  // Skeleton loader
  const Skeleton = ({ h = "h-48" }: { h?: string }) => (
    <div className={`${h} w-full pbi-skeleton`} />
  );

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? <ArrowUp size={10} className="inline ml-1" /> : <ArrowDown size={10} className="inline ml-1" />;
  };

  return (
    <main className="relative flex min-h-screen md:h-screen overflow-y-auto md:overflow-hidden bg-[#05060B] text-white pbi-page">
      {/* Background bioluminescent purple/violet spores */}
      <div className="absolute left-1/3 top-10 h-80 w-80 rounded-full bg-purple-950/15 blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-violet-950/10 blur-3xl pointer-events-none" />

      <Sidebar theme="purple" />

      <div className={`flex-1 flex flex-col md:pl-80 transition-all ${isFullscreen ? "pbi-fullscreen !pl-0 !pt-0" : "pt-16 md:pt-0"} overflow-y-auto md:overflow-hidden`}>
        {/* Ribbon */}
        <PBIRibbon
          onRefresh={cargarClientes}
          onExport={exportarCSV}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
          filtersOpen={filtersOpen}
          cargando={cargando}
          lastUpdate={lastUpdate}
        />

        <div className={`flex flex-1 overflow-y-auto md:overflow-hidden transition-all ${filtersOpen ? "md:mr-64" : ""}`}>
          {/* Canvas */}
          <div className="pbi-canvas flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar p-4 md:p-6">

             {/* ── KPI Cards ── */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
               {[
                 { label: "Total Clientes", val: total, icon: <Users size={15} />, color: "text-purple-300", iconColor: "text-purple-400", bg: "bg-purple-500/10", bgImage: "/card_bg_mycelium.png" },
                 { label: "Activos", val: activos, icon: <CheckCircle size={15} />, color: "text-fuchsia-300", iconColor: "text-fuchsia-400", bg: "bg-fuchsia-500/10", bgImage: "/card_bg_spores.png", sub: `${pctActivos}%` },
                 { label: "Inactivos", val: inactivos, icon: <XCircle size={15} />, color: "text-violet-300", iconColor: "text-violet-400", bg: "bg-violet-500/10", bgImage: "/card_bg_mushrooms.png" },
                 { label: "Territorios", val: territorios, icon: <MapPin size={15} />, color: "text-indigo-300", iconColor: "text-indigo-400", bg: "bg-indigo-500/10", bgImage: "/card_bg_forest.png" },
               ].map((kpi) => (
                 <div key={kpi.label} className="pbi-tile group relative overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 border-purple-500/10 bg-gradient-to-br from-purple-500/10 via-[#0A060F]/90 to-[#05060B]/95">
                   {/* Background image in purple/violet tint */}
                   <div className="absolute inset-0 pointer-events-none select-none z-0">
                     <Image
                       src={kpi.bgImage}
                       alt=""
                       fill
                       className="object-cover opacity-[0.08] mix-blend-screen"
                       style={{ filter: "hue-rotate(140deg) saturate(1.8) brightness(0.9)" }}
                     />
                     <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#060408]/60 to-[#0A060F]/90" />
                   </div>
 
                   {/* Hover shimmer effect */}
                   <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.015] to-transparent transition-transform duration-700 group-hover:translate-x-full z-0" />
 
                   <div className="relative z-10 p-4">
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-[0.6rem] font-bold uppercase tracking-wider text-purple-200/50">{kpi.label}</span>
                       <div className={`w-7 h-7 rounded-md ${kpi.bg} ${kpi.iconColor} flex items-center justify-center`}>
                         {kpi.icon}
                       </div>
                     </div>
                     <p className={`text-2xl font-extrabold ${kpi.color}`}>
                       {cargando ? <span className="pbi-skeleton inline-block w-12 h-7" /> : kpi.val}
                     </p>
                     {kpi.sub && !cargando && (
                       <p className="text-[0.65rem] text-purple-300/40 mt-1">{kpi.sub} tasa de actividad</p>
                     )}
                   </div>
                 </div>
               ))}
             </div>

            {cargando ? (
              <div className="space-y-4">
                <Skeleton h="h-64" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton h="h-56" />
                  <Skeleton h="h-56" />
                </div>
              </div>
            ) : total === 0 ? (
              <div className="pbi-tile flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
                <Users size={40} className="text-zinc-700" />
                <p className="text-base font-bold text-white">Sin datos en el ecosistema</p>
                <p className="text-sm">Registra clientes para ver el reporte.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ── Area Chart: Crecimiento ── */}
                <PBITile title="Crecimiento Acumulado del Micelio" icon={<TrendingUp size={13} className="text-purple-400" />} bgImage="/card_bg_mycelium.png">
                  <div className="h-64 w-full">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={crecimientoData}>
                          <defs>
                            <linearGradient id="gAcum" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="fecha" stroke="#6B5B8A" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#6B5B8A" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip content={<ChartTooltip />} wrapperStyle={{ pointerEvents: "none" }} isAnimationActive={false} />
                          <Area type="monotone" dataKey="acumulado" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#gAcum)" name="acumulado" />
                          <Area type="monotone" dataKey="nuevos" stroke="#C084FC" strokeWidth={1.5} fillOpacity={0} name="nuevos" strokeDasharray="4 4" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </PBITile>

                {/* ── Row: Bar + Donut ── */}
                <div className="grid md:grid-cols-2 gap-4">
                  <PBITile title="Top Municipios" icon={<MapPin size={13} className="text-purple-400" />} bgImage="/card_bg_spores.png">
                    <div className="h-56 w-full">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ciudadesData.slice(0, 8)} layout="vertical">
                            <XAxis type="number" stroke="#6B5B8A" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" stroke="#6B5B8A" fontSize={10} tickLine={false} axisLine={false} width={80} />
                            <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} wrapperStyle={{ pointerEvents: "none" }} isAnimationActive={false} />
                            <Bar dataKey="value" name="Clientes" radius={[0, 4, 4, 0]} barSize={16}>
                              {ciudadesData.slice(0, 8).map((_, i) => (
                                <Cell key={i} fill={COLORS_BAR[i % COLORS_BAR.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </PBITile>

                  <PBITile title="Ciclo de Actividad" icon={<Calendar size={13} className="text-purple-400" />} bgImage="/card_bg_mushrooms.png">
                    <div className="h-56 w-full flex items-center justify-center relative">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart onMouseMove={handlePieMouseMove} onMouseLeave={handlePieMouseLeave}>
                            <Tooltip content={<PieTooltip />} wrapperStyle={{ pointerEvents: "none" }} isAnimationActive={false} position={pieTooltipPos || undefined} />
                            <Pie data={dataEstados} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                              {dataEstados.map((e, i) => (
                                <Cell key={i} fill={e.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      {/* Center label */}
                      <div className="absolute flex flex-col items-center pointer-events-none">
                        <span className="text-2xl font-extrabold text-white">{pctActivos}%</span>
                        <span className="text-[0.55rem] font-bold text-purple-400 uppercase tracking-wider">Activos</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center gap-6 pt-1 pb-1">
                      <span className="flex items-center gap-1.5 text-[0.7rem] text-zinc-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Activos ({activos})
                      </span>
                      <span className="flex items-center gap-1.5 text-[0.7rem] text-zinc-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-300" /> Inactivos ({inactivos})
                      </span>
                    </div>
                  </PBITile>
                </div>

                {/* ── Radar Chart: Territorial mycelium network ── */}
                {ciudadesData.length > 1 && (
                  <PBITile title="Nodos de Crecimiento Territorial — Municipios" icon={<MapPin size={13} className="text-purple-400" />} bgImage="/card_bg_forest.png">
                    <div className="h-64 w-full flex items-center justify-center">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "50%" : "75%"} data={ciudadesData}>
                            <PolarGrid stroke="rgba(139, 92, 246, 0.15)" />
                            <PolarAngleAxis dataKey="name" tick={{ fill: "#C084FC", fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar
                              name="Clientes"
                              dataKey="value"
                              stroke="#8B5CF6"
                              fill="#C084FC"
                              fillOpacity={0.2}
                              dot={{ r: 3, fill: "#A78BFA", strokeWidth: 1.5 }}
                            />
                            <Tooltip content={<RadarTooltip />} wrapperStyle={{ pointerEvents: "none" }} isAnimationActive={false} />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </PBITile>
                )}

                {/* ── Data Table ── */}
                <PBITile title={`Tabla de Datos — ${total} registros`} icon={<Users size={13} className="text-purple-400" />} bodyClass="!p-0" bgImage="/sidebar_bg.png">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="pbi-table">
                      <thead>
                        <tr>
                          <th onClick={() => handleSort("nombre")}>Nombre <SortIcon col="nombre" /></th>
                          <th onClick={() => handleSort("ciudad")}>Ciudad <SortIcon col="ciudad" /></th>
                          <th onClick={() => handleSort("estado")}>Estado <SortIcon col="estado" /></th>
                          <th onClick={() => handleSort("fechaRegistro")}>Fecha <SortIcon col="fechaRegistro" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((c) => (
                          <tr key={c._id}>
                            <td className="font-semibold text-white/90">{c.nombre}</td>
                            <td>{c.ciudad || "—"}</td>
                            <td>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                                c.estado === "Activo" ? "bg-purple-500/10 text-purple-300" : "bg-fuchsia-500/10 text-fuchsia-300"
                              }`}>
                                {c.estado}
                              </span>
                            </td>
                            <td className="text-zinc-500">
                              {new Date(c.fechaRegistro).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4}>
                            <div className="flex items-center justify-between">
                              <span>Mostrando {Math.min(tablePage * ROWS_PER_PAGE + 1, total)}–{Math.min((tablePage + 1) * ROWS_PER_PAGE, total)} de {total}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setTablePage(Math.max(0, tablePage - 1))}
                                  disabled={tablePage === 0}
                                  className="px-2 py-0.5 rounded text-[0.65rem] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                  ← Anterior
                                </button>
                                <span className="text-[0.65rem] text-zinc-500 px-2">{tablePage + 1} / {totalPages}</span>
                                <button
                                  onClick={() => setTablePage(Math.min(totalPages - 1, tablePage + 1))}
                                  disabled={tablePage >= totalPages - 1}
                                  className="px-2 py-0.5 rounded text-[0.65rem] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                  Siguiente →
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </PBITile>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="mt-6 flex items-center justify-between text-[0.6rem] text-zinc-600 px-1">
              <div className="flex items-center gap-4">
                <span>Powered by <strong className="text-purple-400/60">MycoCRM Analytics</strong></span>
                {(filtroEstado || filtroCiudad) && (
                  <span className="text-purple-400/40">● Filtros aplicados</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="pbi-page-dot active" />
                  <div className="pbi-page-dot" />
                </div>
                <span>Página 1 de 1</span>
              </div>
            </div>

          </div>

          {/* Filter Panel */}
          <PBIFilterPanel
            isOpen={filtersOpen}
            ciudades={ciudadesUnicas}
            filtroEstado={filtroEstado}
            filtroCiudad={filtroCiudad}
            onEstadoChange={(v) => { setFiltroEstado(v); setTablePage(0); }}
            onCiudadChange={(v) => { setFiltroCiudad(v); setTablePage(0); }}
            onClose={() => setFiltersOpen(false)}
            onReset={resetFilters}
          />

          {/* Backdrop on Mobile */}
          {filtersOpen && isMobile && (
            <div
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
            />
          )}
        </div>
      </div>
    </main>
  );
}
