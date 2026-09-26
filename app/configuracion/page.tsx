"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Image from "next/image";
import {
  Save,
  Sprout,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ListOrdered,
  Settings2
} from "lucide-react";

const MUNICIPIOS_PRINCIPALES = [
  "Medellín",
  "Envigado",
  "Bello",
  "Itagüí",
  "Sabaneta",
  "Caldas",
  "La Estrella",
  "Copacabana",
  "Girardota",
  "Rionegro",
  "Marinilla",
  "Guarne",
  "La Ceja"
];

export default function ConfiguracionPage() {
  const [shopName, setShopName] = useState("MycoCRM");
  const [defaultCity, setDefaultCity] = useState("Medellín");
  const [defaultStatus, setDefaultStatus] = useState("Activo");
  const [dashboardLimit, setDashboardLimit] = useState("4");
  
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  useEffect(() => {
    // Load config from localStorage on mount
    const savedName = localStorage.getItem("myco_shop_name");
    const savedCity = localStorage.getItem("myco_default_city");
    const savedStatus = localStorage.getItem("myco_default_status");
    const savedLimit = localStorage.getItem("myco_dashboard_limit");

    if (savedName) setShopName(savedName);
    if (savedCity) setDefaultCity(savedCity);
    if (savedStatus) setDefaultStatus(savedStatus);
    if (savedLimit) setDashboardLimit(savedLimit);
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    try {
      localStorage.setItem("myco_shop_name", shopName);
      localStorage.setItem("myco_default_city", defaultCity);
      localStorage.setItem("myco_default_status", defaultStatus);
      localStorage.setItem("myco_dashboard_limit", dashboardLimit);

      // Trigger sidebar update and dashboard update
      window.dispatchEvent(new Event("myco_config_updated"));

      setMensaje({
        tipo: "success",
        texto: "Configuración guardada correctamente. El micelio se ha adaptado.",
      });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: "Ocurrió un error al guardar localmente: " + String(err),
      });
    } finally {
      // Config guardada
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#050B07] text-white">
      {/* Background bioluminescent spores */}
      <div className="absolute left-1/3 top-10 h-80 w-80 rounded-full bg-green-950/20 blur-3xl" />
      <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-amber-950/15 blur-3xl" />
      
      <Sidebar />

      {/* Changed max-w-5xl to max-w-full so boxes span nicely on large monitors */}
      <section className="relative z-10 flex-1 pt-24 pb-8 px-4 md:p-10 md:pl-[360px] max-w-full overflow-x-hidden">
        
        {/* ─── Premium Glassmorphic Hero Banner ─── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-r from-emerald-950/40 via-[#0C1710] to-[#050B07] p-8 shadow-xl">
          {/* Decorative Background Image */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 md:opacity-30 mix-blend-screen pointer-events-none select-none">
            <Image
              src="/card_bg_forest.png"
              alt="Forest Background"
              fill
              className="object-cover object-right"
              priority
            />
            {/* Smooth mask gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C1710] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              ⚙️ Panel de Control
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Configuración del Sustrato
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Sintoniza las variables de comportamiento de tu base de clientes, gestiona el comportamiento de las vistas e inicializa el terreno.
            </p>
          </div>
        </div>

        {/* ─── Status Messages Banners ─── */}
        {mensaje && (
          <div
            className={`mb-8 animate-scale-in rounded-2xl border p-4 flex items-start gap-3 shadow-lg ${
              mensaje.tipo === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-emerald-950/20"
                : "border-red-500/20 bg-red-500/10 text-red-300 shadow-red-950/20"
            }`}
          >
            {mensaje.tipo === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-400" />
            )}
            <p className="text-sm font-medium">{mensaje.texto}</p>
          </div>
        )}

        {/* ─── Grid: Form + Hongo Kawaii ─── */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">

        {/* Form settings (takes 2 spaces on large screens) */}
        <div className="relative lg:col-span-2 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 backdrop-blur-xl">
            {/* Background image */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <Image
                src="/card_bg_mycelium.png"
                alt=""
                fill
                className="object-cover opacity-[0.05] mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B07] via-[#050B07]/90 to-transparent" />
            </div>

            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2.5 text-amber-200/90">
                <Settings2 size={20} className="text-amber-400" />
                Variables del Ecosistema (Clientes)
              </h2>

              <form onSubmit={handleSaveConfig} className="space-y-6">
                
                {/* Nombre de la tienda */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Sprout size={14} className="text-emerald-500" />
                    Nombre del Ecosistema / CRM
                  </label>
                  <input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Ej. Fungi Shop Medellín"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Municipio Predeterminado */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-500" />
                      Municipio Predeterminado
                    </label>
                    <div className="relative">
                      <select
                        value={defaultCity}
                        onChange={(e) => setDefaultCity(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 cursor-pointer"
                      >
                        <option value="" className="bg-[#0b120e] text-zinc-500">Ninguno (Dejar vacío)</option>
                        {MUNICIPIOS_PRINCIPALES.map((m) => (
                          <option key={m} value={m} className="bg-[#0b120e] text-zinc-300">
                            {m}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Estado Predeterminado */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Clock size={14} className="text-emerald-500" />
                      Estado Predeterminado (Nuevos)
                    </label>
                    <div className="relative">
                      <select
                        value={defaultStatus}
                        onChange={(e) => setDefaultStatus(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 cursor-pointer"
                      >
                        <option value="Activo" className="bg-[#0b120e] text-zinc-300">Activo</option>
                        <option value="Inactivo" className="bg-[#0b120e] text-zinc-300">Inactivo</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Límite del dashboard */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <ListOrdered size={14} className="text-emerald-500" />
                    Límite de Brotes Recientes (Dashboard)
                  </label>
                  <div className="relative">
                    <select
                      value={dashboardLimit}
                      onChange={(e) => setDashboardLimit(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 cursor-pointer"
                    >
                      <option value="4" className="bg-[#0b120e] text-zinc-300">4 registros</option>
                      <option value="6" className="bg-[#0b120e] text-zinc-300">6 registros</option>
                      <option value="8" className="bg-[#0b120e] text-zinc-300">8 registros</option>
                      <option value="10" className="bg-[#0b120e] text-zinc-300">10 registros</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-white/[0.04] flex justify-end">
                  <button
                    type="submit"
                    disabled={false}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs font-bold text-[#050B07] transition hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10 disabled:opacity-50"
                  >
                    <Save size={16} />
                    Guardar Configuración
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Hongo Bailando Kawaii */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 backdrop-blur-xl flex flex-col items-center justify-center min-h-[400px]">
            {/* Background image */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <Image
                src="/card_bg_mushrooms.png"
                alt=""
                fill
                className="object-cover opacity-[0.06] mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B07] via-[#050B07]/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Hongo kawaii bailando */}
              <div className="text-8xl mb-6 animate-bounce">
                🍄
              </div>

              {/* Caritas kawaii flotantes */}
              <div className="flex gap-4 mb-6">
                <span className="text-3xl animate-pulse">✨</span>
                <span className="text-3xl animate-pulse" style={{ animationDelay: "0.2s" }}>💖</span>
                <span className="text-3xl animate-pulse" style={{ animationDelay: "0.4s" }}>✨</span>
              </div>

              <h3 className="text-xl font-bold text-amber-200/90 mb-3">
                Hongo Guardián
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-[200px]">
                Este honguito cuida tu base de datos mientras trabajas. ¡Baila de alegría porque tus datos están seguros!
              </p>

              {/* Suelo de pasto */}
              <div className="mt-6 flex gap-1">
                <span className="text-lg">🌱</span>
                <span className="text-lg">🌿</span>
                <span className="text-lg">🌱</span>
                <span className="text-lg">🌿</span>
                <span className="text-lg">🌱</span>
              </div>
            </div>
          </div>

        </div>

      </section>
    </main>
  );
}
