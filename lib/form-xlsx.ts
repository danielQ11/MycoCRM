import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";

const FORM_XLSX_PATH = path.join(
  process.cwd(),
  "data",
  "respuestas-formulario-final.xlsx"
);

export type FormXlsxData = {
  headers: string[];
  records: Record<string, string>[];
  totalRows: number;
  lastUpdated: string;
};

export async function readFormXlsxBuffer(): Promise<Buffer> {
  return readFile(FORM_XLSX_PATH);
}

export async function readFormXlsxData(): Promise<FormXlsxData> {
  const [buffer, fileInfo] = await Promise.all([
    readFormXlsxBuffer(),
    stat(FORM_XLSX_PATH),
  ]);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames.find(
    (name) => name === "Respuestas de formulario 1"
  ) ?? workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;

  if (!sheet) {
    throw new Error("El XLSX final no contiene una hoja de respuestas.");
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: true,
  });
  const headerRow = rows[0];

  if (!headerRow || headerRow.length === 0) {
    throw new Error("La hoja de respuestas del XLSX está vacía.");
  }

  const headers = headerRow.map((value, index) =>
    String(value ?? `Columna_${index + 1}`)
  );
  const records = rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = String(row[index] ?? "");
    });
    return record;
  });

  return {
    headers,
    records,
    totalRows: records.length,
    lastUpdated: fileInfo.mtime.toISOString(),
  };
}
