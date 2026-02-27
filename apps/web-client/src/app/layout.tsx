import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Typography (Manifesto §7.2):
 * - Inter: Mechanical readability, system descriptions
 * - Cinzel: Dramatic events, scene titles, deity dialogue
 * - Geist Mono: Code/debug overlays
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dungeon Cortex — Simulated Reality Engine",
  description:
    "A D&D 5e Simulated Reality Engine where the AI narrates, but the Code resolves.",
};

import FloatingTextLayer from "@/components/FloatingTextLayer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons&display=block"
        />
      </head>
      <body
        className={`${inter.variable} ${cinzel.variable} ${geistMono.variable} antialiased bg-abyss text-bone`}
      >
        <FloatingTextLayer />
        {children}
      </body>
    </html>
  );
}


