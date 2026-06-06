import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Quiniela", template: "%s | Quiniela" },
  description: "La mejor plataforma de quinielas de fútbol con tus amigos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${outfit.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-pitch-900 text-white">
        {children}
      </body>
    </html>
  );
}
