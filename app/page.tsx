"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { AlertCircle, ArrowUpRight, BarChart3, PieChart, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Cliente = {
  _id: string;
  nombre: string;
  telefono: string;
  correo: string;
  ciudad: string;
  estado: string;
  fechaRegistro: string;
};

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [shopName, setShopName] = useState("MycoCRM");
  const [dashboardLimit, setDashboardLimit] = useState(4);

  useEffect(() => {
    // Load config
    const savedName = localStorage.getItem("myco_shop_name");
    if (savedName) setShopName(savedName);

    const savedLimit = localStorage.getItem("myco_dashboard_limit");
    if (savedLimit) setDashboardLimit(parseInt(savedLimit, 10));

    // Fetch clients
    const cargarClientes = async () => {
      try {
        const res = await fetch("/api/clientes");
        const data = await res.json();
        if (Array.isArray(data)) {
          setClientes(data);
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };

    const handleConfigUpdate = () => {
      const updatedName = localStorage.getItem("myco_shop_name");
      if (updatedName) setShopName(updatedName);

      const updatedLimit = localStorage.getItem("myco_dashboard_limit");
      if (updatedLimit) setDashboardLimit(parseInt(updatedLimit, 10));
    };

    window.addEventListener("myco_config_updated", handleConfigUpdate);

    cargarClientes();

    return () => {
      window.removeEventListener("myco_config_updated", handleConfigUpdate);
    };
  }, []);

  // ─── Estadísticas Generales ───
  const totalClientes = clientes.length;
  const activosClientes = clientes.filter((c) => c.estado === "Activo").length;
  const inactivosClientes = totalClientes - activosClientes;
  
  const nuevosEsteMes = clientes.filter((c) => {
    const fecha = new Date(c.fechaRegistro);
    const ahora = new Date();
    return (
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  }).length;

  const clientesRecientes = clientes.slice(0, dashboardLimit);

  // ─── Lógica para Gráfica de Ciudades ───
  const obtenerCiudadesStats = () => {
    const conteo: Record<string, number> = {};
    clientes.forEach((c) => {
      const ciudad = c.ciudad || "No especificada";
      conteo[ciudad] = (conteo[ciudad] || 0) + 1;
    });

    return Object.entries(conteo)
      .map(([ciudad, cantidad]) => ({ ciudad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Máximo 5 para el top
  };

  const ciudadesStats = obtenerCiudadesStats();
  const maxCantidadCiudad = ciudadesStats.length > 0 ? Math.max(...ciudadesStats.map((c) => c.cantidad)) : 1;

  // ─── Lógica para Donut Chart de Estados ───
  const activoPorcentaje = totalClientes > 0 ? Math.round((activosClientes / totalClientes) * 100) : 0;
  const inactivoPorcentaje = totalClientes > 0 ? 100 - activoPorcentaje : 0;
  
  // Parámetros de la rosca
  const radio = 45;
  const circunferencia = 2 * Math.PI * radio;
  const strokeDashoffsetActivo = circunferencia - (activoPorcentaje / 100) * circunferencia;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
    });
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#050B07] text-white">
      {/* Background bioluminescent spores */}
      <div className="absolute left-1/3 top-10 h-80 w-80 rounded-full bg-green-950/20 blur-3xl" />
      <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-amber-950/15 blur-3xl" />

      <Sidebar />

      <section className="relative z-10 flex-1 pt-24 pb-8 px-4 md:p-10 md:pl-[360px] max-w-full overflow-x-hidden">
        
        {/* ─── Premium Glassmorphic Hero Banner ─── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-r from-emerald-950/40 via-[#0C1710] to-[#050B07] p-8 shadow-xl">
          {/* Decorative Background Image */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 md:opacity-40 mix-blend-screen pointer-events-none select-none">
            <Image
              src="/myco_banner.png"
              alt="Mycelium Network"
              fill
              className="object-cover object-right"
              priority
            />
            {/* Smooth mask gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C1710] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              🌱 Ecosistema CRM
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {shopName}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Administración y mapeo del micelio de tus clientes. Visualiza el crecimiento de tu comunidad micológica en tiempo real.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/clientes"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-[#050B07] transition hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10"
              >
                Gestionar Cultivos (Clientes)
              </Link>
              <Link
                href="/configuracion"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
              >
                Configurar Especie
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            title="Clientes Sembrados"
            value={cargando ? "..." : String(totalClientes)}
            icon="🍄"
            trend="+12% este mes"
            color="amber"
            bgImage="/card_bg_mycelium.png"
          />

          <StatsCard
            title="Clientes Activos"
            value={cargando ? "..." : String(activosClientes)}
            icon="🌿"
            trend={`${activoPorcentaje}% ratio activo`}
            color="green"
            bgImage="/card_bg_spores.png"
          />

          <StatsCard
            title="Nuevas Esporas"
            value={cargando ? "..." : String(nuevosEsteMes)}
            icon="✨"
            trend="Este mes"
            color="blue"
            bgImage="/card_bg_mushrooms.png"
          />
        </div>

        {/* ─── Charts & Recent Activity Section ─── */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          
          {/* Gráfica 1: Distribución por Municipios (Bar chart) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
            {/* Background image */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <Image
                src="/card_bg_mycelium.png"
                alt=""
                fill
                className="object-cover opacity-[0.08] mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B07] via-[#050B07]/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <h2 className="text-lg font-bold text-amber-200/90 flex items-center gap-2 mb-6">
                <BarChart3 size={18} className="text-amber-400" />
                Mapeo de Municipios (Antioquia)
              </h2>

              {cargando ? (
                <div className="flex h-56 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
                </div>
              ) : totalClientes === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                  <Info size={24} className="text-zinc-600" />
                  <p>Sin datos para graficar ciudades.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ciudadesStats.map(({ ciudad, cantidad }) => {
                    const porcentaje = Math.round((cantidad / maxCantidadCiudad) * 100);
                    return (
                      <div key={ciudad} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-300">{ciudad}</span>
                          <span className="font-bold text-amber-400">{cantidad} {cantidad === 1 ? 'cliente' : 'clientes'}</span>
                        </div>
                        <div className="h-3.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            style={{ width: `${porcentaje}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 shadow-[0_0_10px_rgba(74,222,128,0.2)] transition-all duration-1000"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Gráfica 2: Estado de Clientes (Donut chart) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
            {/* Background image */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <Image
                src="/card_bg_spores.png"
                alt=""
                fill
                className="object-cover opacity-[0.08] mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B07] via-[#050B07]/80 to-transparent" />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <h2 className="text-lg font-bold text-amber-200/90 flex items-center gap-2 mb-6">
                <PieChart size={18} className="text-amber-400" />
                Ciclo de Vida del Micelio (Estados)
              </h2>

              {cargando ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
                </div>
              ) : totalClientes === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                  <Info size={24} className="text-zinc-600" />
                  <p>Sin datos para graficar estados.</p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-6">
                  {/* SVG Donut — Centered */}
                  <div className="relative flex items-center justify-center">
                    <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90 transform">
                      {/* Background Circle */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radio}
                        className="stroke-white/5"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      {/* Inactivo Circle */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radio}
                        className="stroke-red-500/25"
                        strokeWidth="12"
                        strokeDasharray={circunferencia}
                        strokeDashoffset={0}
                        fill="transparent"
                      />
                      {/* Activo Arc */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radio}
                        className="stroke-emerald-500 transition-all duration-1000"
                        strokeWidth="12"
                        strokeDasharray={circunferencia}
                        strokeDashoffset={strokeDashoffsetActivo}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-white">{activoPorcentaje}%</span>
                      <span className="text-[0.6rem] font-bold text-emerald-400 uppercase tracking-[0.15em]">Activo</span>
                    </div>
                  </div>

                  {/* Legend — Horizontal on wider, stacked on narrow */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="h-3 w-3 shrink-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      <div className="min-w-0">
                        <p className="text-[0.6rem] text-zinc-500 font-bold uppercase tracking-wider">Activos</p>
                        <p className="text-sm font-bold text-emerald-300 truncate">{activosClientes} clientes ({activoPorcentaje}%)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div className="h-3 w-3 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                      <div className="min-w-0">
                        <p className="text-[0.6rem] text-zinc-500 font-bold uppercase tracking-wider">Inactivos</p>
                        <p className="text-sm font-bold text-red-300 truncate">{inactivosClientes} clientes ({inactivoPorcentaje}%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Recent Activity Section ─── */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Recent Registrations list */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
            {/* Background image */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <Image
                src="/card_bg_forest.png"
                alt=""
                fill
                className="object-cover opacity-[0.06] mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050B07]/90 via-[#050B07]/70 to-[#050B07]/90" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-amber-200/90 flex items-center gap-2">
                  🍄 Brotes Recientes (Registros)
                </h2>
                <Link
                  href="/clientes"
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  Ver todos <ArrowUpRight size={14} />
                </Link>
              </div>

              {cargando ? (
                <div className="flex h-48 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
                </div>
              ) : clientesRecientes.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-zinc-500 text-sm">
                  <AlertCircle size={32} className="text-zinc-600" />
                  <p>Ningún cliente registrado en el sustrato.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {clientesRecientes.map((cliente) => (
                    <div
                      key={cliente._id}
                      className="p-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] transition duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-white text-sm truncate max-w-[140px]">
                          {cliente.nombre}
                        </h4>
                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          cliente.estado === "Activo" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {cliente.estado}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2 truncate">
                        📍 {cliente.ciudad}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 truncate">
                        ✉️ {cliente.correo || "Sin correo"}
                      </p>
                      <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[0.65rem] text-zinc-600">
                        <span>Registrado</span>
                        <span className="font-semibold">{formatearFecha(cliente.fechaRegistro)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mushroom Illustration / Quick tips Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
            {/* Full background image */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <Image
                src="/card_bg_mushrooms.png"
                alt=""
                fill
                className="object-cover opacity-30 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B07] via-[#050B07]/70 to-[#050B07]/40" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full p-6">
              {/* Top spacer for the image to show through */}
              <div className="h-28" />
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-amber-200/90 mb-2">🍄 Cultivo Óptimo</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cada interacción con tus clientes fortalece la red del micelio. Mantén los datos actualizados para mejorar la fructificación de tus ventas.
                </p>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[0.65rem] text-zinc-600 font-bold">
                <span>🌿 Micelio Fuerte</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}