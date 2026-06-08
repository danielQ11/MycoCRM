import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cliente from "@/models/Cliente";

// Headers CORS para permitir acceso desde Power BI Desktop
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS — Preflight para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET — Endpoint optimizado para Power BI
// Devuelve datos en formato tabular plano (sin _id de MongoDB)
export async function GET() {
  try {
    await connectDB();

    const clientes = await Cliente.find().sort({ fechaRegistro: -1 }).lean();

    // Transformar los datos a formato plano para Power BI
    const datosPlanos = clientes.map((cliente) => ({
      id: String(cliente._id),
      nombre: cliente.nombre ?? "",
      telefono: cliente.telefono ?? "",
      correo: cliente.correo ?? "",
      ciudad: cliente.ciudad ?? "",
      estado: cliente.estado ?? "Activo",
      fechaRegistro: cliente.fechaRegistro
        ? new Date(cliente.fechaRegistro).toISOString()
        : null,
    }));

    return NextResponse.json(datosPlanos, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error en endpoint Power BI:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
