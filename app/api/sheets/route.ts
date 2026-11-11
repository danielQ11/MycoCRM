import { NextResponse } from "next/server";
import { readFormXlsxData } from "@/lib/form-xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await readFormXlsxData();

    return NextResponse.json(
      {
        configured: true,
        headers: data.headers,
        records: data.records,
        totalRows: data.totalRows,
        cached: false,
        lastUpdated: data.lastUpdated,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[sheets API] No se pudo leer el XLSX final:", error);

    return NextResponse.json(
      {
        configured: true,
        error:
          "No se pudo leer el XLSX final. Verifica que data/respuestas-formulario-final.xlsx esté disponible.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
