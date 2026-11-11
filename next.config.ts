import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/sheets": ["./data/respuestas-formulario-final.xlsx"],
    "/api/sheets/export": ["./data/respuestas-formulario-final.xlsx"],
  },
};

export default nextConfig;
