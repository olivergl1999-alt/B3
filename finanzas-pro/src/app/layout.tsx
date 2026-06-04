import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinanzasPro — Control Financiero Personal y Empresarial",
  description: "Aplicación profesional para gestionar ingresos, gastos, metas de ahorro y analíticas financieras.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-[#111111] text-white antialiased">{children}</body>
    </html>
  );
}
