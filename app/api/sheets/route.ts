import { NextResponse } from "next/server";
import {
  readGoogleSheet,
  rowsToRecords,
  isGoogleConfigured,
  FormRecord,
  SheetData,
} from "@/lib/google-sheets";

// Cache en memoria para no golpear Google Sheets en cada petición
let cachedData: { data: SheetData; records: FormRecord[]; timestamp: number } | null = null;
const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutos

function getCachedData() {
  if (!cachedData) return null;
  if (Date.now() - cachedData.timestamp > CACHE_DURATION_MS) {
    cachedData = null;
    return null;
  }
  return cachedData;
}

function setCachedData(data: SheetData, records: FormRecord[]) {
  cachedData = { data, records, timestamp: Date.now() };
}

// Forzar revalidación en cada request
export const dynamic = "force-dynamic";

export async function GET() {
  // Verificar configuración
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Google Sheets no está configurada. Coloca las variables GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY y GOOGLE_PROJECT_ID en .env.local.",
      },
      { status: 200 }
    );
  }

  try {
    // Intentar usar caché primero
    const cached = getCachedData();
    if (cached) {
      return NextResponse.json({
        configured: true,
        headers: cached.data.headers,
        records: cached.records,
        totalRows: cached.records.length,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString(),
      });
    }

    // Leer desde Google Sheets
    const sheetData = await readGoogleSheet();
    const records = rowsToRecords(sheetData);

    // Guardar en caché
    setCachedData(sheetData, records);

    return NextResponse.json({
      configured: true,
      headers: sheetData.headers,
      records,
      totalRows: records.length,
      cached: false,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // No registrar detalles sensibles
    console.error("[sheets API] Error:", message.replace(/-----BEGIN[\s\S]*?-----END[\s\S]*?-----/g, "[REDACTED]"));

    return NextResponse.json(
      {
        configured: true,
        error: "No se pudieron leer los datos de Google Sheets. Verifica tus credenciales y el ID del Sheet.",
      },
      { status: 200 }
    );
  }
}
