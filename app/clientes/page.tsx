"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Search, Sparkles, Users, UserPlus } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ClientesTable from "@/components/clientes/ClientesTable";
import ClienteModal from "@/components/clientes/ClienteModal";
import ConfirmarEliminar from "@/components/clientes/ConfirmarEliminar";

type Cliente = {
  _id: string;
  nombre: string;
  telefono: string;
  correo: string;
  ciudad: string;
  estado: string;
  fechaRegistro: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modal de crear/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] =
    useState<Cliente | null>(null);

  // Modal de eliminar
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] =
    useState<Cliente | null>(null);

  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();

      if (Array.isArray(data)) {
        setClientes(data);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(texto) ||
      (c.telefono && c.telefono.toLowerCase().includes(texto)) ||
      (c.correo && c.correo.toLowerCase().includes(texto)) ||
      (c.ciudad && c.ciudad.toLowerCase().includes(texto))
    );
  });

  // Abrir modal para nuevo cliente
  const abrirNuevo = () => {
    setClienteEditando(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirEditar = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModalAbierto(true);
  };

  // Abrir confirmación de eliminar
  const abrirEliminar = (cliente: Cliente) => {
    setClienteAEliminar(cliente);
    setConfirmarEliminar(true);
  };

  // Ejecutar eliminación
  const ejecutarEliminar = async () => {
    if (!clienteAEliminar) return;

    try {
      const res = await fetch(
        `/api/clientes/${clienteAEliminar._id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        await cargarClientes();
        setConfirmarEliminar(false);
        setClienteAEliminar(null);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#060E08] text-white">
      {/* ─── Background Bioluminescent Forest & Spores ─── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="/sidebar_bg.png"
          alt=""
          fill
          className="object-cover opacity-[0.08] mix-blend-screen"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E08] via-transparent to-[#0B1A0F]/80" />
      </div>

      {/* Glow effects */}
      <div className="absolute left-10 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-20 bottom-20 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute left-1/3 top-1/3 h-80 w-80 rounded-full bg-green-500/5 blur-[100px] pointer-events-none" />

      {/* Floating interactive spores */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[12%] left-[18%] w-2.5 h-2.5 rounded-full bg-emerald-400/40 blur-[1px] animate-[float-spore_8s_infinite]" />
        <div className="absolute top-[45%] left-[25%] w-1.5 h-1.5 rounded-full bg-amber-300/35 blur-[1px] animate-[float-spore_12s_infinite]" />
        <div className="absolute top-[28%] left-[70%] w-3 h-3 rounded-full bg-green-400/30 blur-[2px] animate-[float-spore_10s_infinite]" />
        <div className="absolute top-[75%] left-[15%] w-2 w-2 rounded-full bg-emerald-300/40 blur-[1px] animate-[float-spore_9s_infinite]" />
        <div className="absolute top-[60%] left-[80%] w-2 h-2 rounded-full bg-amber-400/30 blur-[1px] animate-[float-spore_11s_infinite]" />
        <div className="absolute top-[82%] left-[55%] w-1.5 h-1.5 rounded-full bg-green-300/45 blur-[0.5px] animate-[float-spore_7s_infinite]" />
      </div>

      <Sidebar theme="default" />

      <section className="relative z-10 flex-1 pt-24 pb-8 px-4 md:p-10 md:pl-[360px] max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                🌱
              </span>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-500/80">Ecosistema Activo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-amber-100 to-emerald-100 bg-clip-text text-transparent">
              Clientes
            </h1>
            <p className="text-zinc-400 text-sm flex items-center gap-2">
              <span>Gestiona tu base de clientes y fortalece el micelio comercial.</span>
              {!cargando && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  <Users size={12} /> {clientes.length} {clientes.length === 1 ? "nodo" : "nodos"}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="group relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 px-6 py-3.5 font-bold text-black shadow-lg shadow-emerald-950/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            {/* Glow overlay */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <UserPlus size={18} strokeWidth={2.5} />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        {/* Tabla Container (Glassmorphic design) */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/10 via-[#0B1A0F]/90 to-[#060E08]/95 p-4 md:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80 animate-scale-in">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h2 className="text-xl font-bold text-amber-200/90 tracking-wide">
                Registros del Ecosistema
              </h2>
            </div>

            <div className="relative w-full sm:w-80 group">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, barrio, correo..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-amber-500/50 focus:bg-black/60 focus:shadow-[0_0_15px_rgba(212,168,83,0.15)] text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full custom-scrollbar">
            <ClientesTable
              clientes={clientesFiltrados}
              cargando={cargando}
              onEditar={abrirEditar}
              onEliminar={abrirEliminar}
            />
          </div>
        </div>
      </section>

      {/* Modal Crear / Editar */}
      <ClienteModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setClienteEditando(null);
        }}
        onSave={cargarClientes}
        cliente={clienteEditando}
      />

      {/* Modal Confirmar Eliminar */}
      <ConfirmarEliminar
        isOpen={confirmarEliminar}
        onClose={() => {
          setConfirmarEliminar(false);
          setClienteAEliminar(null);
        }}
        onConfirm={ejecutarEliminar}
        nombreCliente={clienteAEliminar?.nombre || ""}
      />
    </main>
  );
}