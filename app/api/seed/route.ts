import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cliente from "@/models/Cliente";

const MOCK_CLIENTES = [
  {
    nombre: "Juan Pérez",
    telefono: "3001234567",
    correo: "juan.perez@gmail.com",
    ciudad: "Medellín",
    estado: "Activo",
  },
  {
    nombre: "Ana Gómez",
    telefono: "3109876543",
    correo: "ana.gomez@gmail.com",
    ciudad: "Envigado",
    estado: "Activo",
  },
  {
    nombre: "Carlos Ruiz",
    telefono: "3155558888",
    correo: "carlos.ruiz@gmail.com",
    ciudad: "Sabaneta",
    estado: "Inactivo",
  },
  {
    nombre: "Hifas del Valle",
    telefono: "3014567890",
    correo: "hifasvalle@gmail.com",
    ciudad: "Rionegro",
    estado: "Activo",
  },
  {
    nombre: "María Fungicultura",
    telefono: "3201112222",
    correo: "maria.fungi@gmail.com",
    ciudad: "Bello",
    estado: "Activo",
  },
];

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const action = body.action || "seed";

    if (action === "clear") {
      await Cliente.deleteMany({});
      return NextResponse.json({ message: "Base de datos limpiada correctamente" });
    }

    // Insert mock clients
    const clientesInsertados = await Cliente.insertMany(MOCK_CLIENTES);

    return NextResponse.json({
      message: "Clientes de prueba creados",
      count: clientesInsertados.length,
    });
  } catch (error) {
    console.error("Error en /api/seed:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
