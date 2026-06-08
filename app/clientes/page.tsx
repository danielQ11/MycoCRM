"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
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
    <main className="relative flex min-h-screen overflow-hidden bg-[#0A0F0D] text-white">
      {/* Glow effects */}
      <div className="absolute left-20 top-20 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
      <div className="absolute right-40 bottom-40 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />

      <Sidebar />

      <section className="relative z-10 flex-1 pt-24 pb-8 px-4 md:p-10 md:pl-[360px] max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Clientes</h1>

            <p className="mt-2 text-zinc-400 text-sm">
              Gestiona tu base de clientes.
              {!cargando && (
                <span className="ml-2 text-zinc-500 font-semibold">
                  ({clientes.length}{" "}
                  {clientes.length === 1
                    ? "registrado"
                    : "registrados"}
                  )
                </span>
              )}
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-black transition hover:scale-105 hover:bg-green-400"
          >
            <Plus size={18} />
            Nuevo Cliente
          </button>
        </div>

        {/* Tabla Container */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 md:p-8 backdrop-blur-xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-amber-200/90">
              Clientes registrados
            </h2>

            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, barrio, correo..."
                className="w-full rounded-xl border border-white/10 bg-black/20 py-2 pl-9 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-green-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
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