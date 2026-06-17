import type { Metadata } from "next";
import { Cormorant_Garamond, Lora, Spectral } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const bodyFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const detailFont = Spectral({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-detail",
});

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
    <html
      lang="pt-BR"
      className={`${displayFont.variable} ${bodyFont.variable} ${detailFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
