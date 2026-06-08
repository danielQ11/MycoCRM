import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cliente from "@/models/Cliente";

// GET — Obtener todos los clientes
export async function GET() {
  try {
    await connectDB();

    const clientes = await Cliente.find().sort({ fechaRegistro: -1 });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("ERROR COMPLETO:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// POST — Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const nuevoCliente = await Cliente.create(body);

    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}