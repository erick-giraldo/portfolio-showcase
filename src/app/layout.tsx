import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { introBootstrapScript } from "@/components/landing/intro-script";
import { themeBootstrapScript } from "@/components/landing/theme-script";
import { Providers } from "./providers";
// Self-hosted fonts (next/font/google fails in Vercel's current Turbopack build).
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/600.css";
import "@fontsource/rajdhani/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Erick Giraldo Muñoz",
  description: "Portafolio de Erick Giraldo Muñoz.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Run before paint: apply the stored theme and decide whether the intro plays. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <script dangerouslySetInnerHTML={{ __html: introBootstrapScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
