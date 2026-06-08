"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Leaf,
  Sparkles,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [shopName, setShopName] = useState("MycoCRM");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    // Leer nombre inicial
    const saved = localStorage.getItem("myco_shop_name");
    if (saved) setShopName(saved);

    // Escuchar actualizaciones en tiempo real
    const handleConfigUpdate = () => {
      const updated = localStorage.getItem("myco_shop_name");
      if (updated) setShopName(updated);
    };

    window.addEventListener("myco_config_updated", handleConfigUpdate);
    return () => {
      window.removeEventListener("myco_config_updated", handleConfigUpdate);
    };
  }, []);

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setIsOpenMobile(false);
  }, [pathname]);

  const links = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Vista general",
    },
    {
      href: "/clientes",
      label: "Clientes",
      icon: Users,
      description: "Gestionar base",
    },
    {
      href: "#",
      label: "Analíticas",
      icon: BarChart3,
      disabled: true,
      description: "Próximamente",
    },
    {
      href: "/configuracion",
      label: "Configuración",
      icon: Settings,
      description: "Ajustes del CRM",
    },
  ];

  const tips = [
    "Mantén los datos actualizados para mejor seguimiento.",
    "Cada cliente activo fortalece tu red de micelio.",
    "Usa los filtros para encontrar clientes rápidamente.",
    "Revisa las analíticas cuando estén disponibles.",
  ];

  const tipDelDia = tips[new Date().getDay() % tips.length];

  return (
    <>
      {/* Mobile Top Navbar (Hidden on Desktop) */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.04] bg-[#080F0A]/95 px-6 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-green-500/20 text-lg">
            🍄
          </div>
          <span className="text-sm font-bold text-amber-200/90 truncate max-w-[150px]">
            {shopName}
          </span>
        </div>
        <button
          onClick={() => setIsOpenMobile(true)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Dark overlay for mobile when sidebar is open */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-white/[0.04] bg-[#080F0A] transition-all duration-300 ease-in-out md:translate-x-0 h-screen overflow-hidden ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ─── Background Image ─── */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <Image
            src="/sidebar_bg.png"
            alt=""
            fill
            className="object-cover opacity-[0.07] mix-blend-screen"
            priority
          />
          {/* Gradient mask: dark at top/bottom, subtle in middle */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080F0A] via-transparent to-[#080F0A]" />
        </div>

        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-20 top-10 h-40 w-40 rounded-full bg-amber-500/[0.04] blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-20 h-32 w-32 rounded-full bg-emerald-500/[0.03] blur-3xl" />

        {/* ─── Logo & Close button on Mobile ─── */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.04] px-6 py-6 md:py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-green-500/20 text-2xl shadow-lg shadow-amber-500/5">
              🍄
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-amber-200/90 truncate max-w-[140px]">
                {shopName}
              </h1>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-emerald-600/80">
                Cultivando relaciones
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Navigation ─── */}
        <nav className="relative z-10 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-zinc-600">
            Menú principal
          </p>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href === "/" && pathname === "/dashboard");
            const isDisabled = link.disabled;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-amber-500/10 to-transparent text-amber-300 shadow-sm shadow-amber-500/5 border border-amber-500/10"
                    : isDisabled
                      ? "cursor-not-allowed text-zinc-700"
                      : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
                  }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${isActive
                      ? "bg-amber-500/15 text-amber-400"
                      : isDisabled
                        ? "text-zinc-700"
                        : "text-zinc-600 group-hover:text-zinc-400"
                    }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="block">{link.label}</span>
                  {isActive && (
                    <span className="block text-[0.6rem] text-amber-400/60 font-normal">
                      {link.description}
                    </span>
                  )}
                </div>

                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                )}

                {isDisabled && (
                  <span className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-[0.6rem] text-zinc-600">
                    Pronto
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ─── Tip del día ─── */}
        <div className="relative z-10 px-5 mt-2">
          <div className="rounded-xl border border-amber-500/[0.08] bg-gradient-to-br from-amber-900/10 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-amber-400/70" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-amber-400/60">
                Tip del día
              </p>
            </div>
            <p className="text-[0.7rem] text-zinc-500 leading-relaxed">
              {tipDelDia}
            </p>
          </div>
        </div>

        {/* ─── Quick Stats Mini ─── */}
        <div className="relative z-10 px-5 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-lg font-extrabold text-emerald-400/90">🌿</p>
              <p className="text-[0.6rem] text-zinc-600 font-semibold uppercase mt-1">Activos</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-lg font-extrabold text-amber-400/90">📊</p>
              <p className="text-[0.6rem] text-zinc-600 font-semibold uppercase mt-1">Reportes</p>
            </div>
          </div>
        </div>

        {/* ─── Spacer to push bottom content down ─── */}
        <div className="flex-1" />

        {/* ─── Decorative forest image strip ─── */}
        <div className="relative z-10 mx-5 mb-4 overflow-hidden rounded-xl border border-white/[0.04]">
          <div className="relative h-28">
            <Image
              src="/sidebar_bg.png"
              alt="Bosque de micelio"
              fill
              className="object-cover opacity-40 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080F0A] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center gap-1.5">
                <Leaf size={11} className="text-emerald-500/70" />
                <p className="text-[0.6rem] font-bold text-emerald-400/70 uppercase tracking-wider">
                  Bosque Digital
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom info ─── */}
        <div className="relative z-10 border-t border-white/[0.04] px-5 py-4">
          <div className="rounded-xl bg-gradient-to-br from-emerald-900/20 to-amber-900/10 px-4 py-3">
            <p className="text-xs font-semibold text-emerald-400/80">
              🌱 Ecosistema activo
            </p>
            <p className="mt-1 text-[0.65rem] text-zinc-500">
              Tu red de micelio crece cada día
            </p>
          </div>
          <p className="mt-3 text-center text-[0.55rem] text-zinc-700 font-medium">
            MycoCRM v1.0.0 — Medellín, CO
          </p>
        </div>
      </aside>
    </>
  );
}