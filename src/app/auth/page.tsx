import type { Metadata } from "next";
import { AuthPage } from "./AuthPage";

const title = "Acceso al panel — Erick Giraldo";
const description = "Inicia sesión para administrar el contenido del portafolio.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuthPage />;
}
