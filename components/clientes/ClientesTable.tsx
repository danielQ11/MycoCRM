"use client";

import { Pencil, Trash2 } from "lucide-react";
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

type Props = {
  clientes: Cliente[];
  cargando: boolean;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (cliente: Cliente) => void;
};

export default function ClientesTable({
  clientes,
  cargando,
  onEditar,
  onEliminar,
}: Props) {
  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-500" />
          <p className="text-sm text-zinc-500">
            Cargando clientes...
          </p>
        </div>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 text-zinc-500">
        <div className="relative w-24 h-24 mix-blend-screen pointer-events-none select-none">
          <Image
            src="/mushrooms.png"
            alt="Mushroom Family"
            fill
            className="object-contain"
          />
        </div>
        <p className="font-bold text-zinc-400">No hay clientes registrados aún</p>
        <p className="text-xs text-zinc-600">
          Presiona &quot;+ Nuevo Cliente&quot; para agregar uno al sustrato
        </p>
      </div>
    );
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="p-4 text-left text-sm font-medium text-zinc-400">
              Nombre
            </th>
            <th className="p-4 text-left text-sm font-medium text-zinc-400">
              Teléfono
            </th>
            <th className="p-4 text-left text-sm font-medium text-zinc-400">
              Correo
            </th>
            <th className="p-4 text-left text-sm font-medium text-zinc-400">
              Ciudad
            </th>
            <th className="p-4 text-left text-sm font-medium text-zinc-400">
              Estado
            </th>
            <th className="p-4 text-left text-sm font-medium text-zinc-400">
              Fecha Registro
            </th>
            <th className="p-4 text-right text-sm font-medium text-zinc-400">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cliente) => (
            <tr
              key={cliente._id}
              className="group border-t border-white/10 transition hover:bg-white/5"
            >
              <td className="p-4 font-medium text-white">
                {cliente.nombre}
              </td>

              <td className="p-4 text-zinc-300">
                {cliente.telefono || "—"}
              </td>

              <td className="p-4 text-zinc-300">
                {cliente.correo || "—"}
              </td>

              <td className="p-4 text-zinc-300">
                {cliente.ciudad || "—"}
              </td>

              <td className="p-4">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    cliente.estado === "Activo"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {cliente.estado}
                </span>
              </td>

              <td className="p-4 text-zinc-300">
                {formatearFecha(cliente.fechaRegistro)}
              </td>

              <td className="p-4">
                <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => onEditar(cliente)}
                    title="Editar"
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onEliminar(cliente)}
                    title="Eliminar"
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}