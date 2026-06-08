"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nombreCliente: string;
};

export default function ConfirmarEliminar({
  isOpen,
  onClose,
  onConfirm,
  nombreCliente,
}: Props) {
  const [eliminando, setEliminando] = useState(false);

  const handleConfirm = async () => {
    setEliminando(true);
    await onConfirm();
    setEliminando(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-3xl border border-red-500/20 bg-[#111916] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Trash2 size={24} className="text-red-400" />
        </div>

        <h3 className="text-xl font-bold text-white">
          ¿Eliminar cliente?
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          Estás a punto de eliminar a{" "}
          <span className="font-semibold text-white">
            {nombreCliente}
          </span>
          . Esta acción no se puede deshacer.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={eliminando}
            className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
