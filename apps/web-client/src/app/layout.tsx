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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${cinzel.variable} ${geistMono.variable} antialiased bg-abyss text-bone`}
      >
        {children}
      </body>
    </html>
  );
}
