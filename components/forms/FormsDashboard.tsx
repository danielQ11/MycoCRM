"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Download,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  Filter,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

// ─── Gráficos SVG personalizados ───

function MiniBarChart({ data, color = "#2DD4BF" }: { data: { name: string; value: number }[]; color?: string }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-300 truncate max-w-[70%]">{item.name}</span>
            <span className="text-zinc-500">{item.value}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniDonutChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ["#2DD4BF", "#06B6D4", "#0EA5E9", "#14B8A6", "#67E8F9", "#0891B2", "#5EEAD4", "#0D9488"];

  // Pre-calculate angles functionally (no mutation)
  const segments = data.reduce<Array<{ name: string; value: number; startAngle: number; endAngle: number }>>(
    (acc, item) => {
      const prevEnd = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
      const startAngle = prevEnd;
      const endAngle = prevEnd + (item.value / total) * 360;
      return [...acc, { ...item, startAngle, endAngle }];
    },
    []
  );

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
        {segments.map((item, i) => {
          const startRad = (item.startAngle - 90) * (Math.PI / 180);
          const endRad = (item.endAngle - 90) * (Math.PI / 180);
          const percentage = item.value / total;
          const largeArc = percentage > 0.5 ? 1 : 0;

          const x1 = 60 + 50 * Math.cos(startRad);
          const y1 = 60 + 50 * Math.sin(startRad);
          const x2 = 60 + 50 * Math.cos(endRad);
          const y2 = 60 + 50 * Math.sin(endRad);

          const ix1 = 60 + 30 * Math.cos(startRad);
          const iy1 = 60 + 30 * Math.sin(startRad);
          const ix2 = 60 + 30 * Math.cos(endRad);
          const iy2 = 60 + 30 * Math.sin(endRad);

          const path = `M ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A 30 30 0 ${largeArc} 0 ${ix1} ${iy1} Z`;

          return <path key={item.name} d={path} fill={colors[i % colors.length]} opacity={0.8} />;
        })}
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0 w-full">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-zinc-300 truncate">{item.name}</span>
            <span className="text-zinc-500 ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniLineChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const height = 100;
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - (d.value / maxValue) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * width;
        const y = height - (d.value / maxValue) * height;
        return <circle key={i} cx={x} cy={y} r="3" fill="#2DD4BF" />;
      })}
    </svg>
  );
}

// ─── Tipos ───

type FormRecord = Record<string, string>;

type SheetsResponse = {
  configured: boolean;
  headers?: string[];
  records?: FormRecord[];
  totalRows?: number;
  error?: string;
  lastUpdated?: string;
  cached?: boolean;
};

// ─── Constantes ───

const REFRESH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos
// Gráficos usan colores turquesa definidos en cada componente SVG

// ─── Helpers ───

function formatDate(dateStr: string): string {
  if (!dateStr) return "Sin fecha";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getColumnKeys(headers: string[]): {
  dateKey: string | null;
  categoryKey: string | null;
  stateKey: string | null;
  cityKey: string | null;
  advisorKey: string | null;
  sweepKey: string | null;
  knowKey: string | null;
  desireKey: string | null;
  interestKey: string | null;
} {
  const findKey = (patterns: RegExp[]) =>
    headers.find((h) => patterns.some((p) => p.test(h))) || null;

  return {
    dateKey: findKey([
      /fecha|date|tiempo|time|marca temporal/i,
    ]),
    categoryKey: findKey([
      /categor|tipo|producto|servicio|motivo|inter[eé]s|preferencia|motivaci[oó]n|aspecto/i,
    ]),
    stateKey: findKey([
      /estado|status|condici[oó]n|c[oó]mo fue|llamada|gesti[oó]n/i,
    ]),
    cityKey: findKey([
      /ciudad|municipio|localidad|residencia/i,
    ]),
    advisorKey: findKey([
      /asesor|vendedor|agente|responsable|encargado/i,
    ]),
    sweepKey: findKey([
      /barrido|barrido fue|ronda|visita/i,
    ]),
    knowKey: findKey([
      /conoce|conoc[ií]a|micogrow|sabe/i,
    ]),
    desireKey: findKey([
      /desea|deseo|quiere|interesado|inter[eé]s/i,
    ]),
    interestKey: findKey([
      /aspecto|inter[eé]s|mayor inter[eé]s/i,
    ]),
  };
}

// Nombres cortos y claros para los gráficos
const CHART_LABELS: Record<string, string> = {
  knowKey: "¿Conoce MicoGrow?",
  desireKey: "¿Qué desea el cliente?",
  interestKey: "¿Cuál es su mayor interés?",
  stateKey: "¿Cómo fue la llamada?",
  categoryKey: "¿Qué le interesa?",
  cityKey: "¿De qué ciudad es?",
  advisorKey: "¿Quién es el asesor?",
  sweepKey: "¿Qué barrido fue?",
};

// Etiquetas cortas para respuestas comunes del formulario
function getShortLabel(value: string): string {
  if (!value || value.trim() === "") return "Sin respuesta";
  const lower = value.toLowerCase();
  // Orden importa: primero específicas, luego generales
  if (lower.includes("no contactado") || lower.includes("no se encuentra")) return "No contactado";
  if (lower.includes("no contestó") || lower.includes("no contesto")) return "No contestó";
  if (lower.includes("cortó") || lower.includes("corto")) return "Colgó";
  if (lower.includes("no está interesado") || lower.includes("no esta interesado")) return "No interesado";
  if (lower.includes("no exitosa") || lower.includes("no exitoso")) return "No exitosa";
  if (lower.includes("incompleta") || lower.includes("incompleto")) return "Incompleta";
  if (lower.includes("encuesta completa")) return "Encuesta completa";
  if (lower.includes("recibir el catálogo") || lower.includes("recibir el catalogo")) return "Recibir catálogo";
  if (lower.includes("realizar una compra") || lower.includes("realizar compra")) return "Realizar compra";
  if (lower.includes("solicita mas información") || lower.includes("solicita más información") || lower.includes("mas información") || lower.includes("más información")) return "Más información";
  if (lower.includes("micogrow") && lower.includes("no")) return "No conoce";
  if (lower.includes("micogrow") && lower.includes("sí")) return "Conoce";
  if (lower === "la respuesta es sí" || lower === "la respuesta es si" || lower === "sí" || lower === "si") return "Sí";
  if (lower === "la respuesta es no" || lower === "no") return "No";
  if (lower.includes("exitosa")) return "Exitosa";
  if (lower.includes("descanso")) return "Descanso";
  if (lower.includes("estrés") || lower.includes("estres")) return "Estrés";
  if (lower.includes("energía") || lower.includes("energia") || lower.includes("enegía")) return "Energía";
  if (lower.includes("bienestar")) return "Bienestar general";
  if (lower.includes("concentración") || lower.includes("concentracion")) return "Concentración";
  return value;
}

// ─── Componente Principal ───

export default function FormsDashboard() {
  const [data, setData] = useState<SheetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("all");
  const [selectedSweep, setSelectedSweep] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(15);
  const [customFilters, setCustomFilters] = useState<Record<string, string>>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Cargar datos
  const fetchData = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    try {
      const res = await fetch("/api/sheets" + (force ? "?t=" + Date.now() : ""));
      const json = await res.json();
      setData(json);
      setError(json.error || null);
    } catch (err) {
      setError("Error de conexión al cargar los datos del formulario.");
      console.error("[FormsDashboard] Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Intervalo automático
  useEffect(() => {
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Procesar datos para gráficos
  const chartData = useMemo(() => {
    if (!data?.records || !data.headers) return null;
    const { dateKey, categoryKey, stateKey, cityKey, advisorKey, sweepKey, knowKey, desireKey, interestKey } = getColumnKeys(data.headers);
    return { dateKey, categoryKey, stateKey, cityKey, advisorKey, sweepKey, knowKey, desireKey, interestKey, records: data.records };
  }, [data]);

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    if (!data?.records) return [];
    return data.records.filter((record) => {
      // Excluir automáticamente registros sin categoría
      if (chartData?.categoryKey && !record[chartData.categoryKey]) return false;
      if (chartData?.categoryKey && selectedCategory !== "all") {
        if (record[chartData.categoryKey] !== selectedCategory) return false;
      }
      if (chartData?.stateKey && selectedState !== "all") {
        if (record[chartData.stateKey] !== selectedState) return false;
      }
      if (chartData?.cityKey && selectedCity !== "all") {
        if (record[chartData.cityKey] !== selectedCity) return false;
      }
      if (chartData?.advisorKey && selectedAdvisor !== "all") {
        if (record[chartData.advisorKey] !== selectedAdvisor) return false;
      }
      if (chartData?.sweepKey && selectedSweep !== "all") {
        if (record[chartData.sweepKey] !== selectedSweep) return false;
      }
      // Filtros personalizados
      for (const [key, value] of Object.entries(customFilters)) {
        if (value && value !== "all") {
          if (record[key] !== value) return false;
        }
      }
      return true;
    });
  }, [data, chartData, selectedCategory, selectedState, selectedCity, selectedAdvisor, selectedSweep, customFilters]);

  // Datos para gráfico de categorías
  const categoryChartData = useMemo(() => {
    if (!chartData?.categoryKey) return [];
    const conteo: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const raw = r[chartData.categoryKey!] || "";
      const cat = getShortLabel(raw);
      conteo[cat] = (conteo[cat] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [chartData, filteredRecords]);

  // Datos para gráfico de tendencia temporal
  const trendData = useMemo(() => {
    if (!chartData?.dateKey) return [];
    const conteo: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const fecha = r[chartData.dateKey!];
      if (!fecha) return;
      // Extraer año-mes para agrupar
      const date = new Date(fecha);
      let key: string;
      if (!isNaN(date.getTime())) {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = fecha.slice(0, 7);
      }
      conteo[key] = (conteo[key] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([periodo, cantidad]) => ({ periodo, cantidad }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [chartData, filteredRecords]);

  // Datos para gráfico de estados
  const stateChartData = useMemo(() => {
    if (!chartData?.stateKey) return [];
    const conteo: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const raw = r[chartData.stateKey!] || "Sin estado";
      const estado = getShortLabel(raw);
      conteo[estado] = (conteo[estado] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [chartData, filteredRecords]);

  // Datos para gráfico de conocimiento MicoGrow
  const knowChartData = useMemo(() => {
    if (!chartData?.knowKey) return [];
    const conteo: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const raw = r[chartData.knowKey!] || "Sin respuesta";
      const val = getShortLabel(raw);
      conteo[val] = (conteo[val] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [chartData, filteredRecords]);

  // Datos para gráfico de deseos del cliente
  const desireChartData = useMemo(() => {
    if (!chartData?.desireKey) return [];
    const conteo: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const raw = r[chartData.desireKey!] || "Sin respuesta";
      const val = getShortLabel(raw);
      conteo[val] = (conteo[val] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [chartData, filteredRecords]);

  // Datos para gráfico de intereses
  const interestChartData = useMemo(() => {
    if (!chartData?.interestKey) return [];
    const conteo: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const raw = r[chartData.interestKey!] || "Sin respuesta";
      const val = getShortLabel(raw);
      conteo[val] = (conteo[val] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [chartData, filteredRecords]);

  // Opciones de filtros
  const categoryOptions = useMemo(() => {
    if (!chartData?.categoryKey || !data?.records) return [];
    const set = new Set<string>();
    data.records.forEach((r) => {
      const val = r[chartData.categoryKey!];
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [chartData, data]);

  const stateOptions = useMemo(() => {
    if (!chartData?.stateKey || !data?.records) return [];
    const set = new Set<string>();
    data.records.forEach((r) => {
      const val = r[chartData.stateKey!];
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [chartData, data]);

  const cityOptions = useMemo(() => {
    if (!chartData?.cityKey || !data?.records) return [];
    const set = new Set<string>();
    data.records.forEach((r) => {
      const val = r[chartData.cityKey!];
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [chartData, data]);

  const advisorOptions = useMemo(() => {
    if (!chartData?.advisorKey || !data?.records) return [];
    const set = new Set<string>();
    data.records.forEach((r) => {
      const val = r[chartData.advisorKey!];
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [chartData, data]);

  const sweepOptions = useMemo(() => {
    if (!chartData?.sweepKey || !data?.records) return [];
    const set = new Set<string>();
    data.records.forEach((r) => {
      const val = r[chartData.sweepKey!];
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [chartData, data]);

  // ─── Render: Estado no configurado ───
  if (!loading && data && !data.configured) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-950/20 via-[#0A1512] to-[#050B07] p-8">
        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
            <FileSpreadsheet size={32} className="text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-teal-200">
            Google Sheets no está configurado
          </h3>
          <p className="max-w-md text-sm text-zinc-400 leading-relaxed">
            Para visualizar las respuestas del formulario, configura las
            variables de entorno{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-teal-300 text-xs">
              GOOGLE_SHEET_ID
            </code>
            ,{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-teal-300 text-xs">
              GOOGLE_CLIENT_EMAIL
            </code>
            ,{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-teal-300 text-xs">
              GOOGLE_PRIVATE_KEY
            </code>{" "}
            y{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-teal-300 text-xs">
              GOOGLE_PROJECT_ID
            </code>{" "}
            en tu archivo <code className="rounded bg-white/5 px-1.5 py-0.5 text-teal-300 text-xs">.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  // ─── Render: Cargando ───
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-500" />
            <p className="text-sm text-zinc-500">Cargando respuestas del formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Error ───
  if (error && !data?.records) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-[#0A1512] to-[#050B07] p-8">
        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-red-200">
            Error al cargar datos
          </h3>
          <p className="max-w-md text-sm text-zinc-400">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-2.5 text-xs font-bold text-[#050B07] transition hover:scale-[1.02]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const headers = data?.headers || [];
  const records = filteredRecords;

  // ─── Render: Dashboard con datos ───
  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-teal-200/90 flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-teal-400" />
              Respuestas del Formulario
            </h2>
            {data?.lastUpdated && (
              <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1.5">
                <Clock size={12} />
                Última actualización: {formatDate(data.lastUpdated)}
                {data.cached && (
                  <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[0.6rem] text-zinc-500">
                    caché
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Actualizar
            </button>
            <button
              onClick={() => {
                window.location.href = "/api/sheets/export";
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-xs font-bold text-[#050B07] transition hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/10"
            >
              <Download size={14} />
              Exportar Excel
            </button>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf5C6Fv1WwM4R7xPHodaFb7l12OAG52pkkhFZ_-aDpsvA0hCg/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/10 hover:border-cyan-500/35"
            >
              <ExternalLink size={14} />
              Llenar Formulario
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 to-[#0A1512] p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Total Respuestas
          </p>
          <p className="mt-2 text-3xl font-extrabold text-teal-400">
            {records.length}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-950/10 to-[#0A1512] p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Columnas
          </p>
          <p className="mt-2 text-3xl font-extrabold text-cyan-400">
            {headers.length}
          </p>
        </div>
        <div className="rounded-2xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 to-[#0A1512] p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Recientes (7 días)
          </p>
          <p className="mt-2 text-3xl font-extrabold text-cyan-400">
            {chartData?.dateKey
              ? records.filter((r) => {
                  const fecha = new Date(r[chartData.dateKey!]);
                  const hace7Dias = new Date();
                  hace7Dias.setDate(hace7Dias.getDate() - 7);
                  return !isNaN(fecha.getTime()) && fecha >= hace7Dias;
                }).length
              : "—"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      {(categoryOptions.length > 0 || stateOptions.length > 0 || cityOptions.length > 0 || advisorOptions.length > 0 || sweepOptions.length > 0) && (
        <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 via-[#0A1512] to-[#050B07] p-5 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
            <Filter size={14} className="text-teal-400" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {chartData?.categoryKey && categoryOptions.length > 0 && (
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  Interés
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-mushroom text-sm"
                >
                  <option value="all">Todos</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {chartData?.stateKey && stateOptions.length > 0 && (
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  Estado Llamada
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="input-mushroom text-sm"
                >
                  <option value="all">Todos</option>
                  {stateOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {chartData?.cityKey && cityOptions.length > 0 && (
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  Ciudad
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="input-mushroom text-sm"
                >
                  <option value="all">Todas</option>
                  {cityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {chartData?.advisorKey && advisorOptions.length > 0 && (
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  Asesor
                </label>
                <select
                  value={selectedAdvisor}
                  onChange={(e) => setSelectedAdvisor(e.target.value)}
                  className="input-mushroom text-sm"
                >
                  <option value="all">Todos</option>
                  {advisorOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {chartData?.sweepKey && sweepOptions.length > 0 && (
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  Barrido
                </label>
                <select
                  value={selectedSweep}
                  onChange={(e) => setSelectedSweep(e.target.value)}
                  className="input-mushroom text-sm"
                >
                  <option value="all">Todos</option>
                  {sweepOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtros Avanzados */}
      {data?.headers && data.headers.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-cyan-950/10 via-[#0A1512] to-[#050B07] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
              <Filter size={14} className="text-cyan-400" />
              Filtros Avanzados
            </h3>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              {showAdvancedFilters ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {/* Badges de filtros activos */}
          {Object.keys(customFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(customFilters).map(([campo, valor]) => (
                <span
                  key={campo}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs text-cyan-300"
                >
                  <span className="font-bold truncate max-w-[120px]">{campo}:</span>
                  <span className="truncate max-w-[150px]">{valor}</span>
                  <button
                    onClick={() =>
                      setCustomFilters((prev) => {
                        const nuevo = { ...prev };
                        delete nuevo[campo];
                        return nuevo;
                      })
                    }
                    className="text-cyan-400 hover:text-cyan-200 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {showAdvancedFilters && (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Campo
              </label>
              <select
                value=""
                onChange={(e) => {
                  const campo = e.target.value;
                  if (campo) {
                    setCustomFilters((prev) => ({ ...prev, [campo]: "all" }));
                  }
                }}
                className="input-mushroom text-sm"
              >
                <option value="">Seleccionar campo...</option>
                {data.headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
            {Object.entries(customFilters).map(([campo, valor]) => (
              <div key={campo} className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-cyan-400/70 mb-1.5 uppercase tracking-wider truncate">
                  {campo}
                </label>
                <div className="flex gap-2">
                  <select
                    value={valor}
                    onChange={(e) =>
                      setCustomFilters((prev) => ({
                        ...prev,
                        [campo]: e.target.value,
                      }))
                    }
                    className="input-mushroom text-sm flex-1"
                  >
                    <option value="all">Todos</option>
                    {Array.from(
                      new Set(
                        (data?.records || [])
                          .map((r) => r[campo])
                          .filter(Boolean)
                      )
                    )
                      .sort()
                      .map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() =>
                      setCustomFilters((prev) => {
                        const nuevo = { ...prev };
                        delete nuevo[campo];
                        return nuevo;
                      })
                    }
                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}

          {Object.keys(customFilters).length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setCustomFilters({})}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                Limpiar filtros avanzados
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tendencia temporal */}
        {trendData.length > 0 && chartData?.dateKey && (
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl lg:col-span-2">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-teal-400" />
              Tendencia de Respuestas
            </h3>
            <MiniLineChart data={trendData.map((d) => ({ name: d.periodo, value: d.cantidad }))} />
          </div>
        )}

        {/* Distribución por categoría */}
        {categoryChartData.length > 0 && chartData?.categoryKey && (
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-cyan-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
              <Filter size={14} className="text-cyan-400" />
              Por Categoría
            </h3>
            <MiniBarChart data={categoryChartData} color="#2DD4BF" />
          </div>
        )}

        {/* Distribución por estado */}
        {stateChartData.length > 0 && chartData?.stateKey && (
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
              <Filter size={14} className="text-cyan-400" />
              Por Estado
            </h3>
            <MiniDonutChart data={stateChartData} />
          </div>
        )}

        {/* Conoce MicoGrow */}
        {knowChartData.length > 0 && chartData?.knowKey && (
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
              <Filter size={14} className="text-teal-400" />
              {CHART_LABELS.knowKey}
            </h3>
            <MiniDonutChart data={knowChartData} />
          </div>
        )}

        {/* Deseos del cliente */}
        {desireChartData.length > 0 && chartData?.desireKey && (
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-cyan-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
              <Filter size={14} className="text-cyan-400" />
              {CHART_LABELS.desireKey}
            </h3>
            <MiniBarChart data={desireChartData} color="#06B6D4" />
          </div>
        )}

        {/* Intereses principales */}
        {interestChartData.length > 0 && chartData?.interestKey && (
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
              <Filter size={14} className="text-teal-400" />
              {CHART_LABELS.interestKey}
            </h3>
            <MiniBarChart data={interestChartData} color="#2DD4BF" />
          </div>
        )}
      </div>

      {/* Tabla de respuestas */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-950/10 via-[#0A1512] to-[#050B07] p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
            <Clock size={14} className="text-teal-400" />
            {visibleCount >= records.length ? "Todas las Respuestas" : "Respuestas Recientes"}
          </h3>
          <span className="text-xs text-zinc-500">
            {Math.min(visibleCount, records.length)} de {records.length}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-zinc-500 text-sm">
            Sin respuestas para mostrar con los filtros actuales.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {records.slice(0, visibleCount).map((record, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-teal-500/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-500/10">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Respuesta #{i + 1}
                    </span>
                    {chartData?.dateKey && record[chartData.dateKey!] && (
                      <span className="text-xs text-zinc-500">
                        {formatDate(record[chartData.dateKey!])}
                      </span>
                    )}
                  </div>

                  {/* Preguntas y respuestas */}
                  <div className="space-y-3">
                    {headers.slice(0, visibleCount >= records.length ? headers.length : 6).map((header) => {
                      const value = record[header];
                      if (!value) return null;
                      return (
                        <div key={header}>
                          <p className="text-[0.65rem] font-bold text-teal-400/70 uppercase tracking-wider mb-0.5 truncate">
                            {header}
                          </p>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {header.toLowerCase().includes("fecha") ||
                            header.toLowerCase().includes("date")
                              ? formatDate(value)
                              : value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < records.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 20, records.length))}
                  className="flex items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/5 px-6 py-3 text-xs font-bold text-teal-400 transition hover:bg-teal-500/10 hover:border-teal-500/35"
                >
                  <ChevronDown size={14} />
                  Cargar más ({records.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
