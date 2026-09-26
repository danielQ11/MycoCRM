import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MycoCRM — Tu ecosistema de clientes",
  description:
    "Gestiona tu base de clientes con el poder del micelio. CRM para tiendas de hongos gourmet.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}