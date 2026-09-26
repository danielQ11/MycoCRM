import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { readGoogleSheet, rowsToRecords, isGoogleConfigured } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      { error: "Google Sheets no está configurada." },
      { status: 400 }
    );
  }

  try {
    const sheetData = await readGoogleSheet();
    const records = rowsToRecords(sheetData);

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja principal con los datos
    const ws = XLSX.utils.json_to_sheet(records, {
      header: sheetData.headers,
    });

    // Ajustar anchos de columna
    const colWidths = sheetData.headers.map((header) => {
      const maxLen = Math.max(
        header.length,
        ...records.slice(0, 100).map((r) => String(r[header] || "").length)
      );
      return { wch: Math.min(maxLen + 2, 50) };
    });
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Respuestas");

    // Generar buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const filename = `respuestas_formulario_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[sheets export] Error:", message.replace(/-----BEGIN[\s\S]*?-----END[\s\S]*?-----/g, "[REDACTED]"));

    return NextResponse.json(
      { error: "No se pudo exportar los datos. Verifica tu configuración de Google Sheets." },
      { status: 500 }
    );
  }
}
