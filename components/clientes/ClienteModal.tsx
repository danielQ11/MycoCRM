"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Municipios de Antioquia
const MUNICIPIOS_ANTIOQUIA = [
  "Medellín",
  "Abejorral",
  "Abriaquí",
  "Alejandría",
  "Amagá",
  "Amalfi",
  "Andes",
  "Angelópolis",
  "Angostura",
  "Anorí",
  "Anzá",
  "Apartadó",
  "Arboletes",
  "Argelia",
  "Armenia",
  "Barbosa",
  "Bello",
  "Belmira",
  "Betania",
  "Betulia",
  "Briceño",
  "Buriticá",
  "Cáceres",
  "Caicedo",
  "Caldas",
  "Campamento",
  "Cañasgordas",
  "Caracolí",
  "Caramanta",
  "Carepa",
  "Carolina del Príncipe",
  "Caucasia",
  "Chigorodó",
  "Cisneros",
  "Ciudad Bolívar",
  "Cocorná",
  "Concepción",
  "Concordia",
  "Copacabana",
  "Dabeiba",
  "Donmatías",
  "Ebéjico",
  "El Bagre",
  "El Carmen de Viboral",
  "El Peñol",
  "El Retiro",
  "El Santuario",
  "Entrerríos",
  "Envigado",
  "Fredonia",
  "Frontino",
  "Giraldo",
  "Girardota",
  "Gómez Plata",
  "Granada",
  "Guadalupe",
  "Guarne",
  "Guatapé",
  "Heliconia",
  "Hispania",
  "Itagüí",
  "Ituango",
  "Jardín",
  "Jericó",
  "La Ceja",
  "La Estrella",
  "La Pintada",
  "La Unión",
  "Liborina",
  "Maceo",
  "Marinilla",
  "Montebello",
  "Murindó",
  "Mutatá",
  "Nariño",
  "Nechí",
  "Necoclí",
  "Olaya",
  "Peque",
  "Pueblorrico",
  "Puerto Berrío",
  "Puerto Nare",
  "Puerto Triunfo",
  "Remedios",
  "Rionegro",
  "Sabanalarga",
  "Sabaneta",
  "Salgar",
  "San Andrés de Cuerquia",
  "San Carlos",
  "San Francisco",
  "San Jerónimo",
  "San José de la Montaña",
  "San Juan de Urabá",
  "San Luis",
  "San Pedro de los Milagros",
  "San Pedro de Urabá",
  "San Rafael",
  "San Roque",
  "San Vicente Ferrer",
  "Santa Bárbara",
  "Santa Fe de Antioquia",
  "Santa Rosa de Osos",
  "Santo Domingo",
  "Segovia",
  "Sonsón",
  "Sopetrán",
  "Támesis",
  "Tarazá",
  "Tarso",
  "Titiribí",
  "Toledo",
  "Turbo",
  "Uramita",
  "Urrao",
  "Valdivia",
  "Valparaíso",
  "Vegachí",
  "Venecia",
  "Vigía del Fuerte",
  "Yalí",
  "Yarumal",
  "Yolombó",
  "Yondó",
  "Zaragoza",
];

type ClienteData = {
  _id?: string;
  nombre: string;
  telefono: string;
  correo: string;
  ciudad: string;
  estado: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  cliente: ClienteData | null;
};

const camposVacios: ClienteData = {
  nombre: "",
  telefono: "",
  correo: "",
  ciudad: "",
  estado: "Activo",
};

export default function ClienteModal({
  isOpen,
  onClose,
  onSave,
  cliente,
}: Props) {
  const [form, setForm] = useState<ClienteData>(camposVacios);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [busquedaCiudad, setBusquedaCiudad] = useState("");
  const [ciudadAbierta, setCiudadAbierta] = useState(false);

  const esEdicion = !!cliente?._id;

  useEffect(() => {
    if (cliente) {
      setForm({
        _id: cliente._id,
        nombre: cliente.nombre || "",
        telefono: cliente.telefono || "",
        correo: cliente.correo || "",
        ciudad: cliente.ciudad || "",
        estado: cliente.estado || "Activo",
      });
      setBusquedaCiudad(cliente.ciudad || "");
    } else {
      const defaultCity = typeof window !== "undefined" ? localStorage.getItem("myco_default_city") || "" : "";
      const defaultStatus = typeof window !== "undefined" ? localStorage.getItem("myco_default_status") || "Activo" : "Activo";
      setForm({
        nombre: "",
        telefono: "",
        correo: "",
        ciudad: defaultCity,
        estado: defaultStatus,
      });
      setBusquedaCiudad(defaultCity);
    }
    setErrores({});
    setErrorGeneral("");
    setCiudadAbierta(false);
  }, [cliente, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Para teléfono, solo permitir dígitos
    if (name === "telefono") {
      const soloDigitos = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, [name]: soloDigitos });
    } else {
      setForm({ ...form, [name]: value });
    }

    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores({ ...errores, [name]: "" });
    }
  };

  const handleCiudadSearch = (value: string) => {
    setBusquedaCiudad(value);
    setCiudadAbierta(true);

    // Si el valor no coincide con ningún municipio, limpiar la selección
    if (!MUNICIPIOS_ANTIOQUIA.includes(value)) {
      setForm({ ...form, ciudad: "" });
    }

    if (errores.ciudad) {
      setErrores({ ...errores, ciudad: "" });
    }
  };

  const seleccionarCiudad = (municipio: string) => {
    setForm({ ...form, ciudad: municipio });
    setBusquedaCiudad(municipio);
    setCiudadAbierta(false);
  };

  const municipiosFiltrados = MUNICIPIOS_ANTIOQUIA.filter((m) =>
    m.toLowerCase().includes(busquedaCiudad.toLowerCase())
  );

  // Validación
  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Nombre obligatorio
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    // Teléfono: exactamente 10 dígitos
    if (!form.telefono) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (form.telefono.length !== 10) {
      nuevosErrores.telefono =
        `El teléfono debe tener 10 dígitos (tiene ${form.telefono.length})`;
    }

    // Correo: debe terminar en @gmail.com
    if (!form.correo) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!form.correo.toLowerCase().endsWith("@gmail.com")) {
      nuevosErrores.correo =
        "El correo debe ser de Gmail (@gmail.com)";
    }

    // Ciudad: debe ser un municipio válido de Antioquia
    if (!form.ciudad) {
      nuevosErrores.ciudad = "La ciudad es obligatoria";
    } else if (!MUNICIPIOS_ANTIOQUIA.includes(form.ciudad)) {
      nuevosErrores.ciudad =
        "Selecciona un municipio válido de Antioquia";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) return;

    setGuardando(true);
    setErrorGeneral("");

    try {
      const url = esEdicion
        ? `/api/clientes/${cliente!._id}`
        : "/api/clientes";

      const method = esEdicion ? "PUT" : "POST";

      const { _id, ...datosEnviar } = form;
      void _id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnviar),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      onSave();
      onClose();
    } catch (err) {
      setErrorGeneral(
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#111916] p-8 shadow-2xl shadow-green-500/5">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {esEdicion ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error general */}
        {errorGeneral && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errorGeneral}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Nombre *
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre completo del cliente"
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 ${
                errores.nombre
                  ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-green-500/50 focus:ring-green-500/30"
              }`}
            />
            {errores.nombre && (
              <p className="mt-1 text-xs text-red-400">
                {errores.nombre}
              </p>
            )}
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Teléfono * <span className="text-zinc-600">(10 dígitos)</span>
              </label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="3001234567"
                inputMode="numeric"
                maxLength={10}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 ${
                  errores.telefono
                    ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:border-green-500/50 focus:ring-green-500/30"
                }`}
              />
              {errores.telefono ? (
                <p className="mt-1 text-xs text-red-400">
                  {errores.telefono}
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-600">
                  {form.telefono.length}/10 dígitos
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Correo * <span className="text-zinc-600">(@gmail.com)</span>
              </label>
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="usuario@gmail.com"
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 ${
                  errores.correo
                    ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:border-green-500/50 focus:ring-green-500/30"
                }`}
              />
              {errores.correo && (
                <p className="mt-1 text-xs text-red-400">
                  {errores.correo}
                </p>
              )}
            </div>
          </div>

          {/* Ciudad y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Ciudad * <span className="text-zinc-600">(Antioquia)</span>
              </label>
              <input
                value={busquedaCiudad}
                onChange={(e) => handleCiudadSearch(e.target.value)}
                onFocus={() => setCiudadAbierta(true)}
                placeholder="Buscar municipio..."
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 ${
                  errores.ciudad
                    ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:border-green-500/50 focus:ring-green-500/30"
                }`}
              />

              {/* Dropdown de municipios */}
              {ciudadAbierta && municipiosFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#111916] shadow-xl">
                  {municipiosFiltrados.map((municipio) => (
                    <button
                      key={municipio}
                      type="button"
                      onClick={() => seleccionarCiudad(municipio)}
                      className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-green-500/10 hover:text-green-400 ${
                        form.ciudad === municipio
                          ? "bg-green-500/10 text-green-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {municipio}
                    </button>
                  ))}
                </div>
              )}

              {errores.ciudad && (
                <p className="mt-1 text-xs text-red-400">
                  {errores.ciudad}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30"
              >
                <option value="Activo" className="bg-[#111916]">
                  Activo
                </option>
                <option value="Inactivo" className="bg-[#111916]">
                  Inactivo
                </option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-6 py-3 font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="flex-1 rounded-xl bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : esEdicion
                  ? "Guardar Cambios"
                  : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
