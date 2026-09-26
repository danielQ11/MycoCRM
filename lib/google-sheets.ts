/**
 * Google Sheets Service — utilidades del lado del servidor.
 * Las credenciales permanecen en variables de entorno y NUNCA se exponen al cliente.
 */

// ─── Variables de entorno ───
export function getGoogleConfig() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
  // Manejar tanto saltos de línea reales como \n literales
  const privateKey = rawKey.includes("\\n")
    ? rawKey.replace(/\\n/g, "\n")
    : rawKey;

  return {
    projectId: process.env.GOOGLE_PROJECT_ID || "",
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL || "",
    privateKey,
    sheetId: process.env.GOOGLE_SHEET_ID || "",
    sheetRange: process.env.GOOGLE_SHEET_RANGE || "A1:Z1000",
  };
}

export function isGoogleConfigured(): boolean {
  const config = getGoogleConfig();
  return Boolean(
    config.projectId && config.clientEmail && config.privateKey && config.sheetId
  );
}

// ─── JWT Auth para Service Account ───

function base64urlEncode(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createJWT(
  clientEmail: string,
  privateKey: string
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hora

  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + expiresIn,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Usar Web Crypto API para firmar
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);

  // Convertir PEM a DER (binario) para Web Crypto API
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const der = Buffer.from(pemContents, "base64");

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const encodedSignature = Buffer.from(signature)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${signatureInput}.${encodedSignature}`;
}

export async function getAccessToken(): Promise<string> {
  const config = getGoogleConfig();

  if (!config.clientEmail || !config.privateKey) {
    throw new Error(
      "Credenciales de Google no configuradas. Verifica GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY en .env.local"
    );
  }

  const jwt = await createJWT(config.clientEmail, config.privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error de autenticación con Google (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

// ─── Lectura de Google Sheets ───

export type SheetRow = string[];
export type SheetData = {
  headers: string[];
  rows: SheetRow[];
};

export async function readGoogleSheet(): Promise<SheetData> {
  const config = getGoogleConfig();

  if (!isGoogleConfigured()) {
    throw new Error(
      "Google Sheets no está configurada. Configura las variables de entorno GOOGLE_SHEET_ID y credenciales."
    );
  }

  const accessToken = await getAccessToken();

  const range = encodeURIComponent(config.sheetRange);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values/${range}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al leer Google Sheet (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as {
    values?: SheetRow[];
  };

  const values = data.values || [];

  if (values.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = values[0].map((h, i) => h?.trim() || `Columna_${i + 1}`);
  const rows = values.slice(1);

  return { headers, rows };
}

// ─── Conversión a objetos planos ───

export type FormRecord = Record<string, string>;

export function rowsToRecords(data: SheetData): FormRecord[] {
  return data.rows.map((row) => {
    const record: FormRecord = {};
    data.headers.forEach((header, i) => {
      // Manejar valores vacíos correctamente
      record[header] = (row[i] ?? "").trim();
    });
    return record;
  });
}
