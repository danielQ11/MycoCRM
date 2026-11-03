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

// GET — Resumen/estadísticas para dashboards de Power BI
export async function GET() {
  try {
    await connectDB();

    const [totalClientes, clientesPorCiudad, clientesPorMes] =
      await Promise.all([
        Cliente.countDocuments(),

        // Agrupación por ciudad
        Cliente.aggregate([
          {
            $group: {
              _id: "$ciudad",
              cantidad: { $sum: 1 },
            },
          },
          { $sort: { cantidad: -1 } },
        ]),

        // Agrupación por mes de registro
        Cliente.aggregate([
          {
            $group: {
              _id: {
                año: { $year: "$fechaRegistro" },
                mes: { $month: "$fechaRegistro" },
              },
              cantidad: { $sum: 1 },
            },
          },
          { $sort: { "_id.año": -1, "_id.mes": -1 } },
        ]),
      ]);

    // Formatear datos planos para Power BI
    const porCiudad = clientesPorCiudad.map((item) => ({
      ciudad: item._id ?? "Sin ciudad",
      cantidad: item.cantidad,
    }));

    const porMes = clientesPorMes.map((item) => ({
      año: item._id.año,
      mes: item._id.mes,
      periodo: `${item._id.año}-${String(item._id.mes).padStart(2, "0")}`,
      cantidad: item.cantidad,
    }));

    return NextResponse.json(
      {
        resumenGeneral: [
          {
            totalClientes,
          },
        ],
        clientesPorCiudad: porCiudad,
        clientesPorMes: porMes,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error en endpoint resumen Power BI:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
