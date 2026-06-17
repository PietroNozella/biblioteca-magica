import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Biblioteca Secreta de Ludmila",
  description: "Um enigma liter\u00e1rio de anivers\u00e1rio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
