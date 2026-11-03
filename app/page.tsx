"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { AlertCircle, ArrowUpRight, BarChart3, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import IntroAnimation from "@/components/ui/IntroAnimation";
import { AnimatePresence, motion } from "framer-motion";

type Cliente = {
  _id: string;
  nombre: string;
  telefono: string;
  correo: string;
  ciudad: string;
  fechaRegistro: string;
};

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [shopName, setShopName] = useState("MycoCRM");
  const [dashboardLimit, setDashboardLimit] = useState(4);
  const [introActive, setIntroActive] = useState(true);

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
  const totalCiudades = new Set(
    clientes.map((c) => c.ciudad).filter(Boolean)
  ).size;

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

  // ─── Lógica para Gráfica de Registros Recientes ───
  const registrosPorMes = (() => {
    const ahora = new Date();
    const meses: { key: string; label: string; cantidad: number }[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      meses.push({
        key: `${fecha.getFullYear()}-${fecha.getMonth()}`,
        label: fecha.toLocaleDateString("es-CO", { month: "short" }),
        cantidad: 0,
      });
    }

    const porMes = new Map(meses.map((mes) => [mes.key, mes]));
    clientes.forEach((c) => {
      const fecha = new Date(c.fechaRegistro);
      const mes = porMes.get(`${fecha.getFullYear()}-${fecha.getMonth()}`);
      if (mes) mes.cantidad += 1;
    });

    return meses;
  })();
  const maxRegistrosMes = Math.max(1, ...registrosPorMes.map((m) => m.cantidad));

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
    });
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#050B07] text-white">
      <AnimatePresence>
        {introActive && (
          <IntroAnimation onComplete={() => setIntroActive(false)} />
        )}
      </AnimatePresence>

      {/* Background bioluminescent spores */}
      <div className="absolute left-1/3 top-10 h-80 w-80 rounded-full bg-green-950/20 blur-3xl" />
      <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-amber-950/15 blur-3xl" />

      <Sidebar />

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: introActive ? 0 : 1, y: introActive ? 15 : 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
        className="relative z-10 flex-1 pt-24 pb-8 px-4 md:p-10 md:pl-[360px] max-w-full overflow-x-hidden"
      >
        
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
            title="Municipios"
            value={cargando ? "..." : String(totalCiudades)}
            icon="📍"
            trend="Valle de Aburrá"
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

          {/* Gráfica 2: Registros recientes (últimos 6 meses) */}
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
                <BarChart3 size={18} className="text-amber-400" />
                Nuevos Registros (Últimos 6 Meses)
              </h2>

              {cargando ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
                </div>
              ) : totalClientes === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                  <Info size={24} className="text-zinc-600" />
                  <p>Sin datos para graficar registros.</p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-end">
                  <div className="flex h-52 items-end justify-between gap-3">
                    {registrosPorMes.map((mes) => (
                      <div
                        key={mes.key}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-sm font-bold text-amber-300">
                          {mes.cantidad}
                        </span>
                        <div
                          className="w-full max-w-14 rounded-t-xl bg-gradient-to-t from-emerald-600 to-amber-400 shadow-[0_0_12px_rgba(74,222,128,0.2)] transition-all duration-1000"
                          style={{
                            height: `${Math.max(
                              8,
                              (mes.cantidad / maxRegistrosMes) * 140
                            )}px`,
                          }}
                        />
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500">
                          {mes.label}
                        </span>
                      </div>
                    ))}
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
      </motion.section>
    </main>
  );
}