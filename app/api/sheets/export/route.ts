import { NextResponse } from "next/server";
import { readFormXlsxBuffer } from "@/lib/form-xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const buffer = await readFormXlsxBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Proyecto Formativo (Respuestas).xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[sheets export] No se pudo leer el XLSX final:", error);

    return NextResponse.json(
      { error: "No se pudo descargar el XLSX final." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
